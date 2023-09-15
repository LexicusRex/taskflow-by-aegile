import time
import os
import json
from src.helpers import get_db, add_notification, update_achievement

# from src.performance import calc_task_busyness
# from src.error import InputError, AccessError
from src.classes.task import Task
from src.classes.project import Project
from src.constants import get_active_task, set_task_active, delete_active_task

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def create_task(handle, task_data):
    new_task = Task()
    new_task.new(handle, task_data["project_id"], task_data)
    set_task_active(new_task.t_id, new_task)
    return {}


def delete_task(handle, task_id):
    task = get_active_task(task_id)
    task.delete(handle)
    delete_active_task(task_id)


def get_task(project_id):
    return Task.get_all(project_id)


def update_task_specs(handle, data):
    Project(data["project_id"]).check_permission(handle, "creator")
    task = get_active_task(data["task_id"])
    print(f"{task.is_edit=}")
    task.edit(data)
    # todo - notification
    return {}


def get_user_tasks(identifier, is_handle):
    # Given a user's handle, gets all of their assigned tasks
    """
    json request for get_user_tasks():
    {
        "handle": TEXT,
    }
    """
    conn = get_db()
    task_list = []
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


def task_comment(email, task_id, text, replied_comment_id):
    conn = get_db()
    with conn:
        cur = conn.cursor()
        (poster_id, poster_handle) = cur.execute(
            "SELECT id, handle FROM users WHERE email=?", (email,)
        ).fetchone()

        cur.execute(
            "INSERT INTO comments (task, poster, text, time, replyId) VALUES (?, ?, ?, ?, ?)",
            (task_id, poster_id, text, time.time(), replied_comment_id),
        )

        project_id = cur.execute(
            """
                SELECT tasks.project
                FROM users
                JOIN tasks
                ON users.id = tasks.creator
                WHERE tasks.id=?
            """,
            (task_id,),
        ).fetchone()[0]

        #  Achievements: Write comments
        conn.commit()
        update_achievement("First!", poster_id)
        update_achievement("Thread Weaver", poster_id)

        if replied_comment_id == -1:
            # task creator gets a notification from a comment on the task
            # people assigned to the task will also get a comment
            creator_email = cur.execute(
                """
                    SELECT email
                    FROM users
                    JOIN tasks
                    ON users.id = tasks.creator
                    WHERE tasks.id=?
                """,
                (task_id,),
            ).fetchone()[0]

            assignees_data = cur.execute(
                """
                SELECT users.email
                FROM tasks
                JOIN assigned
                ON tasks.id = assigned.task                
                JOIN users
                ON users.id = assigned.user
                WHERE tasks.id=?
            """,
                (task_id,),
            ).fetchall()

            # Send notifications to assignees of the task being commented on
            # unless they are the task creator, or were the commentor
            for assignees_email in assignees_data:
                if assignees_email[0] != creator_email and assignees_email[0] != email:
                    conn.commit()
                    add_notification(
                        assignees_email[0],
                        poster_handle,
                        "comment",
                        "comment",
                        f"has commented on a task you were assigned",
                        project_id,
                    )

            if email != creator_email:
                # no notification when commenting to your own task
                conn.commit()
                add_notification(
                    creator_email,
                    poster_handle,
                    "comment",
                    "comment",
                    f"has commented on your task",
                    project_id,
                )
        else:
            # user gets a notification if someone replies to their comment
            poster_email = cur.execute(
                """
                    SELECT email 
                    FROM users
                    JOIN comments
                    ON users.id = comments.poster
                    WHERE comments.id=?
                """,
                (replied_comment_id,),
            ).fetchone()[0]

            if email != poster_email:
                # no notification when replying to your own comment
                conn.commit()
                add_notification(
                    poster_email,
                    poster_handle,
                    "comment",
                    "reply",
                    f"has replied to your comment",
                    project_id,
                )


def task_get_comment(task_id):
    conn = get_db()
    comments_list = []

    with conn:
        cur = conn.cursor()

        comments = cur.execute(
            """
                SELECT comments.id, comments.text, users.handle, comments.time, comments.replyId
                FROM comments
                JOIN users
                ON comments.poster = users.id
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
                    ON comments.poster = users.id
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
    if not os.path.exists(f"{BASE_DIR}/task_content/{task_id}.json"):
        return []
        # raise AccessError("Task is being edited by another user")
    with open(f"{BASE_DIR}/task_content/{task_id}.json", "r", encoding="utf-8") as fp:
        return json.load(fp)

def get_task_content(project_id):
    data = []
    with get_db() as conn:
        cur = conn.cursor()
        tasks = cur.execute("SELECT name, id FROM tasks WHERE project = ?", (project_id, )).fetchall()
        for task in tasks:
            data.append({'id': task['id'], 'name': task['name'], 'blocks': get_task_edit(task['id'])})

        return data

def update_task_edit(task_id, task_content: list):
    with open(f"{BASE_DIR}/task_content/{task_id}.json", "w", encoding="utf-8") as fp:
        json.dump(task_content, fp)
