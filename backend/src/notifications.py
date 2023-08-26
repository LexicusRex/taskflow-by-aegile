import datetime
import time
from math import floor
from src.helpers import get_db, add_notification


def add_task_notification(email):
    """
    Adds notifications for upcoming or late tasks of a user

    Parameters:
    email (string): Verified Email of User

    Returns:
    None
    """
    conn = get_db()
    with conn:
        cur = conn.cursor()
        (user_id, user_handle) = cur.execute(
            "SELECT id, handle FROM users WHERE email = ?", (email,)
        ).fetchone()
        # Retrieve all the tasks assigned to a user
        user_tasks = cur.execute(
            """
            SELECT a.task, t.project, t.name AS task_name, u.handle, t.deadline, t.status, p.name AS proj_name
            FROM assigned a
            JOIN tasks t
            ON a.task = t.id
            JOIN projects p
            ON t.project = p.id
            JOIN users u
            ON t.creator = u.id
            WHERE a.user = ?
            AND t.status != 'completed'
            AND t.status != 'blocked'
            """,
            (user_id,),
        ).fetchall()
    for task in user_tasks:
        if task["deadline"] == "Invalid Date":
            continue
        due_date = time.mktime(
            datetime.datetime.strptime(task["deadline"], "%d/%m/%Y").timetuple()
        )
        diff_hours = (due_date - time.time()) / 3600
        if diff_hours <= 24:
            notif_message = "Task: %s from Project: %s is due in %d hours" % (
                task["task_name"],
                task["proj_name"],
                diff_hours,
            )
            add_notification(
                email,
                task["handle"],
                "task",
                task["status"],
                notif_message,
                task["project"],
            )
        elif diff_hours <= 0:
            notif_message = "Task: %s from Project: %s is overdue by %d hours" % (
                task["task_name"],
                task["proj_name"],
                abs(diff_hours),
            )
            add_notification(
                email,
                task["handle"],
                "task",
                task["status"],
                notif_message,
                task["project"],
            )
    return
