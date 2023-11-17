import os.path
import json
from src.helpers import get_db
from src.error import InputError, AccessError
from time import time
from pprint import pprint
from datetime import datetime
from zoneinfo import ZoneInfo

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Task:
    @classmethod
    def get_all(cls, project_id):
        query = """
            SELECT * FROM tasks
            WHERE project = ? AND parent IS NULL
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, (project_id,))
            return [Task().data(task) for task in cur.fetchall()]

    def __init__(self, task_id=None):
        self.t_id = task_id
        self.is_edit = False
        self.editor = None
        self.observers = []

    def fetch(self):
        pass

    def data(self, task):
        task_data = dict(task)
        query = """
            SELECT * FROM tasks
            WHERE parent = ?
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, (task["id"],))
            task_data["subtasks"] = [Task().data(task) for task in cur.fetchall()]
        users = self.get_assignees(task["id"])
        task_data["assignees"] = list(users.keys())
        task_data["assigneesData"] = users
        return task_data

    def new(self, creator_handle, project_id, task_data):
        fields = [
            "name",
            "description",
            "deadline",
            "status",
            "attachment",
            "attachment_name",
            "weighting",
            "priority",
        ]
        query = f"""
            INSERT INTO tasks 
            (creator, project, {', '.join(fields)}, busyness, num_assignees, time_start) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                query,
                (
                    creator_handle,
                    project_id,
                    task_data["name"],
                    task_data["description"],
                    task_data["deadline"],
                    task_data["status"],
                    task_data["attachment"],
                    task_data["attachment_name"],
                    task_data["weighting"],
                    task_data["priority"],
                    16,
                    len(task_data["assignees"]),
                    time(),
                ),
            )
            self.t_id = cur.lastrowid
            # Check if task being created is a subtask
            if task_data.get("parent_id") is not None:
                cur.execute(
                    f"UPDATE tasks SET parent= ? WHERE id = ?",
                    (task_data["parent_id"], self.t_id),
                )
        self.assign_users(task_data["assignees"])

    # Add a new json file to store the task's specs history
    def log_new_task_specs(self):
        with open(
            BASE_DIR + f"/../task_specs/{self.t_id}.json", "w", encoding="utf-8"
        ) as task_report:
            task_report.write(json.dumps([], indent=2))

    def edit(self, data):
        accepted_fields = [
            "name",
            "description",
            "deadline",
            "status",
            # "attachment",
            # "attachmentName",
            "weighting",
            "priority",
        ]
        conn = get_db()
        cur = conn.cursor()
        for field in accepted_fields:
            if field not in data:
                raise InputError(f"Missing task edit field: {field}")
            cur.execute(
                f"UPDATE tasks SET {field}= ? WHERE id = ?", (data[field], self.t_id)
            )
        cur.execute("DELETE FROM assigned WHERE task=?", (self.t_id,))
        conn.commit()
        conn.close()
        self.assign_users(data["assignees"])

    def log_task_spec_history(self, handle, task_data):
        date_edited = datetime.now(ZoneInfo("Australia/Sydney")).strftime("%d/%m/%Y")
        time_edited = datetime.now(ZoneInfo("Australia/Sydney")).strftime("%H:%M")
        format_time = datetime.strptime(time_edited, "%H:%M").strftime("%I:%M %p")

        with open(
            BASE_DIR + f"/../task_specs/{self.t_id}.json", "r", encoding="utf-8"
        ) as task_report:
            contents = json.load(task_report)
            contents.append(
                {
                    "name": task_data["name"],
                    "description": task_data["description"],
                    "deadline": task_data["deadline"],
                    "status": task_data["status"],
                    # "attachment": task_data["attachment"],
                    # "attachmentName": task_data["attachment_name"],
                    "weighting": task_data["weighting"],
                    "priority": task_data["priority"],
                    "assignees": task_data["assignees"],
                    "editor": handle,
                    "dateEdited": date_edited,
                    "timeEdited": format_time,
                },
            )
        with open(
            BASE_DIR + f"/../task_specs/{self.t_id}.json", "w", encoding="utf-8"
        ) as task_report:
            task_report.write(
                json.dumps(
                    contents,
                    indent=2,
                )
            )

    def update_status(self, new_status):
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                f"UPDATE tasks SET status= ? WHERE id = ?", (new_status, self.t_id)
            )

    def delete(self, handle):
        if not self.t_id:
            raise InputError("Task ID not given")
        with get_db() as conn:
            cur = conn.cursor()
            creator = cur.execute(
                "SELECT creator FROM tasks WHERE id = ?", (self.t_id,)
            ).fetchone()["creator"]
            if creator != handle:
                raise AccessError("User is not the creator of this task.")
            cur.execute("DELETE FROM tasks WHERE id = ?", (self.t_id,))

    def get_assignees(self, task_id):
        if not task_id:
            raise InputError("Task not created")
        query = """
            SELECT u.handle, u.first_name || ' ' || u.last_name as name, u.image 
            FROM assigned a
            JOIN users u ON u.handle = a.user
            WHERE task = ?
        """
        assignees = {}
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, (task_id,))
            for user in cur.fetchall():
                assignees[user["handle"]] = dict(user)
            return assignees

    def assign_users(self, assignees):
        if not self.t_id:
            raise InputError("Task not created")
        for user in assignees:
            query = """
                INSERT INTO assigned
                (task, user)
                VALUES (?, ?)
            """
            with get_db() as conn:
                cur = conn.cursor()
                cur.execute(query, (self.t_id, user))
                res = cur.execute("SELECT * FROM assigned").fetchall()
        # TODO - notification

    def get_metrics(self):
        if not self.t_id:
            return
        query = """
            SELECT * FROM metrics
            WHERE task = ?
        """

    def register_edit_lock(self, handle: str) -> None:
        if self.is_edit or self.editor:
            # TODO - notification

            # Add handle to observers
            self.observers.append(handle)
            raise AccessError(f"Task is currently being edited by {self.editor}")

            return

        self.is_edit = True
        self.editor = handle

    def release_edit_lock(self, handle):
        if not self.is_edit:
            # TODO - notification
            raise AccessError(f"Task is currently being edited by {self.editor}")

            # Add handle to observers
            self.observers.append(handle)
            return
        pass

    def set_as_subtask(self, parent_task_id):
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                f"UPDATE tasks SET parent= ? WHERE id = ?", (parent_task_id, self.t_id)
            )

    def remove_as_subtask(self, new_status):
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                f"UPDATE tasks SET parent = NULL, status=? WHERE id = ?",
                (new_status, self.t_id),
            )

    def get_task_spec_history(self):
        with open(
            BASE_DIR + f"/../task_specs/{self.t_id}.json", "r", encoding="utf-8"
        ) as task_report:
            contents = json.load(task_report)
        return contents
