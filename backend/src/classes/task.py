from src.helpers import get_db
from src.error import InputError, AccessError
from time import time
from pprint import pprint


class Task:
    @classmethod
    def get_all(cls, project_id):
        query = """
            SELECT * FROM tasks
            WHERE project = ?
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, (project_id,))
            return [Task().data(task) for task in cur.fetchall()]

    def __init__(self, task_id=None):
        self.t_id = task_id

    def fetch(self):
        pass

    def data(self, task):
        task_data = dict(task)
        users = self.get_assignees(task["id"])
        task_data["assignees"] = list(users.keys())
        task_data["assigneesData"] = users
        pprint(task_data, indent=2)
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
        self.assign_users(task_data["assignees"])

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
                for row in res:
                    print(tuple(row))
        # TODO - notification

    def get_metrics(self):
        if not self.t_id:
            return
        query = """
            SELECT * FROM metrics
            WHERE task = ?
        """
