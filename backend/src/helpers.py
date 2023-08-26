import os.path
import sqlite3
import jwt
from time import time
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(BASE_DIR, "database/database.db")


def get_db():
    """
    Returns connection to database

    Parameters:
    None

    Returns:
    Connection: Connection to database
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def exec_query(command, args):
    with get_db() as conn:
        cur = conn.cursor()
        res = cur.execute(command, args).fetchall()
        return res


def decode_token(token):
    payload = jwt.decode(jwt=token, key="", algorithms=["HS256"])
    return payload["user_id"]


def add_notification(
    recipient: str,
    sender: str,
    notif_type: str,
    status: str,
    message: str,
    project: int,
):
    """
    Adds a notification

    Parameters:
    recipient (str): Email of recipient
    sender (str): Handle of sender
    notif_type (str): Category of notification
    status (str): Status of task
    message (str): Message in notification
    project (int): Id of Project

    Returns:
    return_type: Description of the return value.
    """
    with get_db() as conn:
        cur = conn.cursor()

        if project:
            cur.execute(
                """
                INSERT INTO notifications (recipient, sender, type, status, message, project, timestamp)        
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (recipient, sender, notif_type, status, message, project, time()),
            )
        else:
            cur.execute(
                """
                INSERT INTO notifications (recipient, sender, type, status, message, timestamp)        
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (recipient, sender, notif_type, status, message, time()),
            )


def update_achievement(achievement, user_id, amount=1):
    """
    Increments an achievement

    Parameters:
    achievement (str): Achievement Type
    user_id (int): Id of User

    Returns:
    None
    """
    conn = get_db()
    with conn:
        cur = conn.cursor()
        (progress, achieved, achievement_id, requirement) = cur.execute(
            """
            SELECT earned.progress, earned.achieved, achievements.id, achievements.requirement
            FROM earned
            JOIN achievements
            ON earned.achievement = achievements.id
            WHERE earned.user = ?
            AND achievements.name = ?
            """,
            (user_id, achievement),
        ).fetchone()

        (email, handle) = cur.execute(
            """
            SELECT email, handle
            FROM users
            WHERE id = ?
            """,
            (user_id,),
        ).fetchone()

        new_progress = progress + amount
        if progress < requirement:
            if new_progress >= requirement:
                new_progress = requirement
                add_notification(
                    email,
                    handle,
                    "achievement",
                    "",
                    f"has earned the achievement, {achievement}",
                    None,
                )
            cur.execute(
                "UPDATE earned SET progress=?, achieved=? WHERE user=? AND achievement=?",
                (new_progress, achieved, user_id, achievement_id),
            )


def add_project_to_user_reports(handle, project_id):
    user_reports = json.load(open(BASE_DIR + f"/reports/{handle}.json"))
    user_reports["projects"][str(project_id)] = []
    with open(BASE_DIR + f"/reports/{handle}.json", "w") as output_report:
        output_report.write(json.dumps(user_reports, indent=2))


def delete_project_from_user_reports(handle, project_id):
    user_reports = json.load(open(BASE_DIR + f"/reports/{handle}.json"))
    user_reports["projects"].pop(str(project_id))
    with open(BASE_DIR + f"/reports/{handle}.json", "w") as output_report:
        output_report.write(json.dumps(user_reports, indent=2))
