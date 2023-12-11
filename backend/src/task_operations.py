import time
import os
import json
from pprint import pprint
from src.helpers import get_db, add_notification, update_achievement

# from src.performance import calc_task_busyness
from src.error import InputError
from src.classes.task import Task
from src.classes.project import Project
from src.classes.comment import Comment
from src.constants import get_active_task, set_task_active, delete_active_task

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def create_task(handle, task_data):
    new_task = Task()
    new_task.new(handle, task_data["project_id"], task_data)
    new_task.log_new_task_specs()
    new_task.log_task_spec_history(handle, task_data)
    set_task_active(new_task.t_id, new_task)
    with open(
        f"{BASE_DIR}/task_content/{new_task.t_id}.json", "w", encoding="utf-8"
    ) as fp:
        json.dump([{"time": time.time(), "content": []}], fp)
    return {}


def delete_task(handle, task_id):
    task = get_active_task(task_id)
    task.delete(handle)
    # delete_active_task(task_id)


def get_task(task_id):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        return Task().data(cur.fetchone())


def get_all_tasks(project_id):
    return Task.get_all(project_id)


def update_task_specs(handle, data):
    Project(data["project_id"]).check_permission(handle, "creator")
    task = get_active_task(data["task_id"])
    task.edit(handle, data)
    # todo - notification
    return {}


def get_task_specs_history(task_id):
    return Task(task_id).get_task_spec_history()


def get_user_tasks(handle, is_handle):
    task_list = []
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM tasks t JOIN assigned a ON t.id = a.task WHERE a.user = ?",
            (handle,),
        )

        return [Task().data(task) for task in cur.fetchall()]

    with conn:
        if is_handle:
            user_id = conn.execute(
                "SELECT * FROM users WHERE handle=?", (identifier,)
            ).fetchone()[0]
        else:
            user_id = conn.execute(
                "SELECT * FROM users WHERE email=?", (identifier,)
            ).fetchone()[0]
        sql = """
            SELECT t.id, t.project, t.name, t.description, t.deadline, t.status, t.weighting, t.priority, t.time_start, t.time_end, t.complete_till_due
            FROM tasks t
            JOIN assigned
            ON t.id = assigned.task
            WHERE assigned.user = ?
        """
        assigned_tasks = conn.execute(sql, (user_id,)).fetchall()
        # "assigned" contains a list of handles of the assigned members
        for task in assigned_tasks:
            task_list.append(
                {
                    "id": task[0],
                    "project": task[1],
                    "name": task[2],
                    "description": task[3],
                    "deadline": task[4],
                    "status": task[5],
                    "weighting": task[6],
                    "priority": task[7],
                    "assignees": get_assigned_members(task[0]),
                    "assigneesData": get_assigned_members_data(task[0]),
                    "time_start": task[8],
                    "time_end": task[9],
                    "complete_till_due": task[10],
                }
            )
        task_list.sort(key=sort_dates)

    return {"tasks": task_list}


# Helper function to sort tasks by date
def sort_dates(task):
    if task["deadline"] == "Invalid Date":
        return "999999", "999999", "99999"
    date = task["deadline"].split("/")
    return date[2], date[1], date[0]


# Helper function
def get_assigned_members(task_id):
    members = []
    conn = get_db()
    with conn:
        sql = """
            SELECT users.handle
            FROM users
            JOIN assigned
            ON users.id = assigned.user
            WHERE assigned.task = ?
        """
        assigned = conn.execute(sql, (task_id,)).fetchall()

        for handle in assigned:
            members.append(handle[0])
    return members


def get_assigned_members_data(task_id):
    members = {}
    conn = get_db()
    with conn:
        sql = """
            SELECT users.handle, users.image, users.first_name, users.last_name
            FROM users
            JOIN assigned
            ON users.id = assigned.user
            WHERE assigned.task = ?
        """
        assigned = conn.execute(sql, (task_id,)).fetchall()

        for user in assigned:
            members[user["handle"]] = {
                "handle": user["handle"],
                "image": user["image"],
                "name": user["first_name"] + " " + user["last_name"],
            }
    return members


# Helper function
def get_user_handles(users_ids):
    # given a list of user ids, return a list of corresponding user handles
    conn = get_db()
    users_handles = []

    with conn:
        cur = conn.cursor()
        for id in users_ids:
            handle = cur.execute(
                "SELECT handle FROM users WHERE id=?", (id,)
            ).fetchone()[0]
            users_handles.append(handle)

    return users_handles


# Helper function
def get_user_ids(users_handles):
    # given a list of user handles, return a list of corresponding user ids
    conn = get_db()
    users_ids = []

    with conn:
        cur = conn.cursor()
        for handle in users_handles:
            id = cur.execute(
                "SELECT id FROM users WHERE handle=?", (handle,)
            ).fetchone()[0]
            users_ids.append(id)

    return users_ids


def task_comment(handle, task_id, text, replied_comment_id):
    Comment(task_id).new(handle, text, replied_comment_id)
    # TODO - notifications and achievements


def task_get_comment(task_id):
    return Comment.get_all(task_id)
    conn = get_db()
    comments_list = []

    with conn:
        cur = conn.cursor()

        comments = cur.execute(
            """
                SELECT comments.id, comments.text, users.handle, comments.time, comments.reply_id
                FROM comments
                JOIN users
                ON comments.poster = users.handle
                WHERE comments.task = ?
            """,
            (task_id,),
        ).fetchall()

        for comment in comments:
            comment_data = {
                "id": comment[0],
                "text": comment[1],
                "poster": comment[2],
                "time": comment[3],
            }
            if comment[4] == -1:
                # comment is not a reply
                comment_data["reply"] = False
                comment_data["replyText"] = None
                comment_data["replyHandle"] = None
            else:
                # comment is a reply
                sql = """
                    SELECT comments.text, users.handle
                    FROM comments 
                    JOIN users
                    ON comments.poster = users.handle
                    WHERE comments.id = ?
                """
                data = cur.execute(sql, (comment[4],)).fetchone()
                comment_data["reply"] = True
                comment_data["replyText"] = data[0]
                comment_data["replyHandle"] = data[1]
            comments_list.append(comment_data)

    return comments_list


def task_update_status(handle, task_id, status):
    task = get_active_task(task_id)
    task.update_status(status)
    return {}


def task_set_as_subtask(handle, task_id, parent_id):
    task = get_active_task(task_id)
    task.set_as_subtask(parent_id)
    return {}


def task_remove_as_subtask(handle, task_id, status):
    task = get_active_task(task_id)
    task.remove_as_subtask(status)
    return {}


def register_edit_task_lock(handle, task_id):
    Task(task_id).register_edit_lock(handle)


def get_task_edit(task_id):
    try:
        with open(
            f"{BASE_DIR}/task_content/{task_id}.json", "r", encoding="utf-8"
        ) as fp:
            edit_history = sorted(json.load(fp), key=lambda edit: edit["time"])
            return edit_history[-1]["content"]
    except (FileNotFoundError, KeyError) as err:
        return []
        # raise AccessError("Task is being edited by another user")
    with open(f"{BASE_DIR}/task_content/{task_id}.json", "r", encoding="utf-8") as fp:
        return json.load(fp)


def get_task_content(project_id):
    query = """
        SELECT t.name, t.id 
        FROM tasks t
        JOIN project_task_order pto
        ON t.id = pto.task
        WHERE t.project = ?
        ORDER BY pto.task_index ASC
    """
    data = []
    with get_db() as conn:
        cur = conn.cursor()
        tasks = cur.execute(query, (project_id,)).fetchall()
        for task in tasks:
            data.append(
                {
                    "id": task["id"],
                    "name": task["name"],
                    "blocks": get_task_edit(task["id"]),
                }
            )

        return data


def get_edit_difference(edit_history, task_content):
    # print("removed", [x["content"] for x in edit_history if x not in task_content])
    # print("added", [x["content"] for x in task_content if x not in edit_history])
    return


def update_task_edit(task_id, task_content: list):
    edit_history = []

    try:
        with open(
            f"{BASE_DIR}/task_content/{task_id}.json", "r", encoding="utf-8"
        ) as fp:
            edit_history = json.load(fp)
            # get_edit_difference(edit_history[-1]["content"], task_content)
    except (FileNotFoundError, AttributeError) as error:
        print("Task edit history not found")

    edit_history.append({"time": time.time(), "content": task_content})
    with open(f"{BASE_DIR}/task_content/{task_id}.json", "w", encoding="utf-8") as fp:
        json.dump(edit_history, fp)
        # json.dump([{
        #     "time": time.time(),
        #     "content": task_content
        # }], fp)


def get_task_edit_history(task_id):
    try:
        with open(
            f"{BASE_DIR}/task_content/{task_id}.json", "r", encoding="utf-8"
        ) as fp:
            return sorted(json.load(fp), key=lambda edit: edit["time"], reverse=True)
    except FileNotFoundError:
        raise InputError("Task edit history not found")


def set_task_editor_index(project_id, task_id, parent_id):
    with get_db() as conn:
        cur = conn.cursor()
        Task(task_id).set_subtask_index(cur, project_id, parent_id)
