import time
import datetime
from src.helpers import get_db, add_notification, update_achievement
from src.performance import calc_task_busyness
from src.error import InputError, AccessError
from src.classes.task import Task
from src.classes.project import Project


def create_task(handle, task_data):
    Task().new(handle, task_data["project_id"], task_data)
    return {}

    # conn = get_db()
    # with conn:
    #     cur = conn.cursor()

    #     (creator_id, creator_handle) = cur.execute(
    #         "SELECT id, handle FROM users WHERE email=?", (email,)
    #     ).fetchone()

    #     # Check that the project still exists
    #     project = cur.execute(
    #         "SELECT * FROM projects WHERE id=?", (project_id,)
    #     ).fetchone()
    #     if not project:
    #         raise AccessError("This project no longer exists. Please reload.")

    #     # If no one is assigned to task, assign it to creator
    #     if not assignees:
    #         assignees.append(creator_handle)

    #     task_busyness = (
    #         calc_task_busyness(deadline, weighting, priority, len(assignees))
    #         if deadline != "Invalid Date"
    #         else 0
    #     )

    #     num_assignees = len(assignees)
    #     curr_time = int(time.time())
    #     cur.execute(
    #         """
    #             INSERT INTO tasks
    #             (creator, project, name, description, deadline, status, attachment, attachment_name, weighting, priority, busyness, num_assignees, time_start)
    #             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    #         """,
    #         (
    #             creator_id,
    #             project_id,
    #             name,
    #             description,
    #             deadline,
    #             status,
    #             attachment,
    #             attachment_name,
    #             weighting,
    #             priority,
    #             task_busyness,
    #             num_assignees,
    #             curr_time,
    #         ),
    #     )
    #     task_id = cur.lastrowid
    #     if status == "completed":
    #         cur.execute(
    #             "UPDATE tasks SET time_end=?, complete_till_due=? WHERE id=?",
    #             (curr_time, 0, task_id),
    #         )
    #     assignees_ids = get_user_ids(assignees)

    #     for id in assignees_ids:
    #         cur.execute(
    #             "INSERT INTO assigned (task, user) VALUES (?, ?)", (task_id, id)
    #         )

    #         if id != creator_id:
    #             # No notifications for user creating task
    #             notification_email = cur.execute(
    #                 "SELECT email from users where id=?", (id,)
    #             ).fetchone()[0]
    #             conn.commit()
    #             add_notification(
    #                 notification_email,
    #                 creator_handle,
    #                 "task",
    #                 "assign",
    #                 f"has assigned you the task {name}",
    #                 project_id,
    #             )

    # # Achievements: Create tasks
    # update_achievement("Taskmaker", creator_id)


def delete_task(handle, task_id):
    Task(task_id).delete(handle)
    # """
    # json request for delete_task():
    # {
    #     "taskId": INTEGER,
    # }
    # """
    # conn = get_db()
    # with conn:
    #     cur = conn.cursor()

    #     user_id = cur.execute(
    #         "SELECT id FROM users WHERE email=?", (email,)
    #     ).fetchone()[0]

    #     (project_id, task_creator) = cur.execute(
    #         "SELECT project, creator FROM tasks WHERE id=?", (task_id,)
    #     ).fetchone()

    #     role = cur.execute(
    #         "SELECT role FROM has WHERE user=? AND project=?", (user_id, project_id)
    #     ).fetchone()[0]

    #     # Only team managers or task creators can delete tasks
    #     valid = False
    #     if user_id == task_creator:
    #         valid = True
    #     elif role == "creator" or role == "admin":
    #         valid = True

    #     if not valid:
    #         raise AccessError(
    #             description="Only team managers or the task creator can delete tasks"
    #         )

    #     cur.execute("DELETE FROM assigned WHERE task=?", (task_id,))
    #     cur.execute("DELETE FROM tasks WHERE id=?", (task_id,))
    #     cur.execute("DELETE FROM comments WHERE task=?", (task_id,))


def get_task(project_id):
    return Task.get_all(project_id)
    # conn = get_db()
    # with conn:
    #     cur = conn.cursor()

    #     tasks = cur.execute(
    #         "SELECT * FROM tasks WHERE project=?",
    #         (project_id,),
    #     ).fetchall()

    #     task_list = []

    #     for task in tasks:
    #         data = {
    #             "id": task["id"],
    #             "name": task["name"],
    #             "description": task["description"],
    #             "deadline": task["deadline"],
    #             "status": task["status"],
    #             "attachment": task["attachment"],
    #             "attachmentName": task["attachment_name"],
    #             "weighting": task["weighting"],
    #             "priority": task["priority"],
    #             "assignees": get_assigned_members(task[0]),
    #             "busyness": task["busyness"],
    #             "time_start": task["time_start"],
    #             "time_end": task["time_end"],
    #             "complete_till_due": task["complete_till_due"],
    #         }
    #         task_list.append(data)

    #     return task_list


def update_task_specs(handle, data):
    Project(data["project_id"]).check_permission(handle, "creator")
    Task(data["task_id"]).edit(data)
    return {}
    # conn = get_db()
    # with conn:
    #     cur = conn.cursor()

    #     (user_id, user_handle) = cur.execute(
    #         "SELECT id, handle FROM users WHERE email=?", (email,)
    #     ).fetchone()

    #     # Check that task still exists
    #     task = cur.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
    #     if not task:
    #         raise AccessError("This task no longer exists. Please reload.")

    #     # If new_assignees is empty, assign to task creator
    #     if not new_assignees:
    #         creator_handle = cur.execute(
    #             "SELECT users.handle FROM users JOIN tasks ON users.id = tasks.creator \
    #             WHERE tasks.id=?",
    #             (task_id,),
    #         ).fetchone()["handle"]
    #         new_assignees.append(creator_handle)

    #     (project_id, task_creator, old_status) = cur.execute(
    #         "SELECT project, creator, status FROM tasks WHERE id=?", (task_id,)
    #     ).fetchone()

    #     role = cur.execute(
    #         "SELECT role FROM has WHERE user=? AND project=?", (user_id, project_id)
    #     ).fetchone()[0]

    #     assigned = cur.execute(
    #         "SELECT * FROM assigned WHERE user=? AND task=?", (user_id, task_id)
    #     ).fetchall()

    #     task_assignee = False
    #     if len(assigned) != 0:
    #         task_assignee = True

    #     # Only team managers or task creators can delete task
    #     spec_update = False
    #     progress_update = False

    #     if user_id == task_creator:
    #         spec_update = True
    #     elif role == "creator" or role == "admin":
    #         spec_update = True
    #     if task_assignee == True:
    #         progress_update = True

    #     if spec_update:
    #         task_busyness = (
    #             calc_task_busyness(deadline, weighting, priority, len(new_assignees))
    #             if deadline != "Invalid Date"
    #             else 0
    #         )
    #         num_assignees = len(new_assignees)
    #         cur.execute(
    #             "UPDATE tasks SET name=?, description=?, deadline=?, status=?, attachment=?, attachment_name=?, weighting=?, priority=?, busyness=?, num_assignees=? WHERE id=?",
    #             (
    #                 name,
    #                 description,
    #                 deadline,
    #                 status,
    #                 attachment,
    #                 attachment_name,
    #                 weighting,
    #                 priority,
    #                 task_busyness,
    #                 num_assignees,
    #                 task_id,
    #             ),
    #         )

    #         if status == "completed":
    #             if deadline != "Invalid Date":
    #                 due_date = time.mktime(
    #                     datetime.datetime.strptime(deadline, "%d/%m/%Y").timetuple()
    #                 )
    #                 diff_hours = round((due_date - time.time()) / 3600, 3)
    #                 cur.execute(
    #                     "UPDATE tasks SET time_end=?, complete_till_due=? WHERE id=?",
    #                     (int(time.time()), diff_hours, task_id),
    #                 )
    #             else:
    #                 cur.execute(
    #                     "UPDATE tasks SET time_end=? WHERE id=?",
    #                     (int(time.time()), task_id),
    #                 )
    #         old_assignees_data = cur.execute(
    #             """
    #                 SELECT users.id
    #                 FROM users
    #                 JOIN assigned
    #                 ON users.id = assigned.user
    #                 WHERE assigned.task = ?
    #             """,
    #             (task_id,),
    #         ).fetchall()
    #         old_assignees_ids = []

    #         for id in old_assignees_data:
    #             old_assignees_ids.append(id[0])

    #         cur.execute("DELETE FROM assigned WHERE task=?", (task_id,))

    #         new_assignees_ids = get_user_ids(new_assignees)
    #         for id in new_assignees_ids:
    #             cur.execute(
    #                 "INSERT INTO assigned (task, user) VALUES (?, ?)", (task_id, id)
    #             )

    #         # notifications for new assignees
    #         new_members = set(new_assignees_ids) - set(old_assignees_ids)
    #         for id in new_members:
    #             if id != user_id:
    #                 # No notifications for task updater
    #                 notification_email = cur.execute(
    #                     "SELECT email from users where id=?", (id,)
    #                 ).fetchone()[0]
    #                 conn.commit()
    #                 add_notification(
    #                     notification_email,
    #                     user_handle,
    #                     "task",
    #                     "assign",
    #                     f"has assigned you the task {name}",
    #                     project_id,
    #                 )

    #     elif progress_update:
    #         # need to check they only change status, and not anything else including assignees
    #         valid_progress_update = True
    #         task = cur.execute(
    #             "SELECT name, description, deadline, attachment, attachment_name, weighting, priority FROM tasks WHERE id=?",
    #             (task_id,),
    #         ).fetchone()

    #         # Check user has not changed any field other than task status
    #         if (
    #             task["name"] != name
    #             or task["description"] != description
    #             or task["deadline"] != deadline
    #             or task["attachment"] != attachment
    #             or task["attachment_name"] != attachment_name
    #             or task["weighting"] != weighting
    #             or task["priority"] != priority
    #         ):
    #             valid_progress_update = False

    #         new_task_assignees = set(new_assignees)
    #         old_task_assignees = set(get_assigned_members(task_id))

    #         if new_task_assignees != old_task_assignees:
    #             valid_progress_update = False

    #         if not valid_progress_update:
    #             raise AccessError(
    #                 description="Task assignees can only update task status"
    #             )

    #         # User has only changed status: valid update
    #         cur.execute("UPDATE tasks SET status=? WHERE id=?", (status, task_id))

    #     else:
    #         raise AccessError(
    #             description="Only team managers or the task creator can update tasks"
    #         )

    #     # Achievements: completed tasks
    #     if spec_update or progress_update:
    #         if old_status != "completed" and status == "completed":
    #             new_assignees_ids = get_user_ids(new_assignees)
    #             for id in new_assignees_ids:
    #                 conn.commit()
    #                 update_achievement("Baby Steps", id)
    #                 update_achievement("Getting Productive", id)
    #                 update_achievement("Taskmaster", id)

    #             # Achievements: finish task quickly
    #             time_start = cur.execute(
    #                 "SELECT time_start FROM tasks WHERE id=?", (task_id,)
    #             ).fetchone()[0]
    #             time_diff = int(time.time()) - time_start
    #             if time_diff < 60 * 30:
    #                 update_achievement("Early Bird", user_id)


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
