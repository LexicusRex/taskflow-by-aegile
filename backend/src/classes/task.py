from src.helpers import get_db
from src.error import InputError, AccessError
from time import time
from pprint import pprint


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
    

    def set_subtask_index(self, sql_cursor, project_id, parent_id):
        if parent_id == "null":
            sql_cursor.execute("""
                UPDATE project_task_order
                SET task_index = task_index + 1
                WHERE project = ? AND task_index > 1 ;
            """, (project_id,)) 
            sql_cursor.execute("""
                UPDATE project_task_order
                SET task_index = 1
                WHERE project = ? AND task = ?;
            """, (project_id, self.t_id))
            return
        

        query = """
            SELECT task_index FROM project_task_order WHERE task = ?
        """
        parent_idx = sql_cursor.execute(query, (parent_id,)).fetchone()["task_index"]
        curr_idx = sql_cursor.execute(query, (self.t_id,)).fetchone()["task_index"]
        if curr_idx > parent_idx:
            sql_cursor.execute("""
                UPDATE project_task_order
                SET task_index = task_index + 1
                WHERE project = ? AND task_index >= ? AND task_index <= ?;
            """, (project_id, parent_idx+1, curr_idx-1))
            sql_cursor.execute("""
                UPDATE project_task_order
                SET task_index = ?
                WHERE project = ? AND task = ?;
            """, (parent_idx+1, project_id, self.t_id))

        else:
            sql_cursor.execute("""
                UPDATE project_task_order
                SET task_index = task_index - 1
                WHERE project = ? AND task_index >= ? AND task_index <= ?;
            """, (project_id, curr_idx+1, parent_idx))
            sql_cursor.execute("""
                UPDATE project_task_order
                SET task_index = ?
                WHERE project = ? AND task = ?;
            """, (parent_idx, project_id, self.t_id))
    

    def set_new_task_index(self, sql_cursor, project_id):
        query_select = """
            SELECT COUNT(*) FROM project_task_order
            WHERE project = ?
        """

        query_insert = """
            INSERT INTO project_task_order 
            (project, task, task_index) 
            VALUES (?, ?, ?)
        """

        sql_cursor.execute(query_select, (project_id,))
        count_result = sql_cursor.fetchone()
        new_index = count_result["COUNT(*)"] + 1

        sql_cursor.execute(query_insert, (project_id, self.t_id, new_index))

    def delete_task_index(self, sql_cursor, project_id):
        
        pass

    def set_task_index(self, sql_cursor, project_id, parent_id):
        if not parent_id:
            self.set_new_task_index(sql_cursor, project_id)
            return
        self.set_subtask_index(sql_cursor, project_id, parent_id)
            
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
            self.set_task_index(cur, project_id, task_data.get("parent_id"))

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
        cur.execute(
            f"UPDATE tasks SET time_end= ? WHERE id = ?", (time(), self.t_id)
        )
        cur.execute("DELETE FROM assigned WHERE task=?", (self.t_id,))
        conn.commit()
        conn.close()
        self.assign_users(data["assignees"])

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
            project_id = cur.execute(
                f"SELECT project FROM tasks WHERE id = ?", (self.t_id,)
            ).fetchone()["project"]
            self.set_subtask_index(cur, project_id, parent_task_id)

    def remove_as_subtask(self, new_status):
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                f"UPDATE tasks SET parent = NULL, status=? WHERE id = ?",
                (new_status, self.t_id),
            )
