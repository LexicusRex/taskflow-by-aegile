import os.path
import hashlib
import json
from datetime import datetime
from zoneinfo import ZoneInfo
from random import randint
import pandas as pd
from src.helpers import get_db
from src.error import InputError
from src.__config__ import DATA_PERSISTENCE, ANALYTICS_TIMESPAN

from src.classes.user import User
from src.classes.performance import Performance

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def register_new_user(email, password, first_name, last_name):
    """
    Creates an account for the user with their email, first name, last name
    and password.

    Parameters:
    email (string): Verified Email (Format checked in Frontend)
    passwword (string): Verified Password (Strength checked in frontend)
    first_name (string): User's first name
    last_name (string): User's last name

    Returns:
    None
    """

    # 1. Check if user's email already exists
    new_user = User()
    new_user.register(email, password, first_name, last_name)
    Performance(new_user.handle).new_user()
    return new_user.handle
    # conn = get_db()

    # if not DATA_PERSISTENCE:
    #     # Create directory to store user's analytics
    #     path = os.path.join(BASE_DIR, f"analytics/users")
    #     curr_date = datetime.now(ZoneInfo("Australia/Sydney")).strftime("%H:%M")
    #     if ANALYTICS_TIMESPAN == 86400:
    #         curr_date = datetime.now(ZoneInfo("Australia/Sydney")).strftime(
    #             "%d/%m/%Y"
    #         )

    #     init_data = [[curr_date, 0, 0, 0, 0, 0]]
    #     init_df = pd.DataFrame(
    #         data=init_data,
    #         columns=[
    #             "date",
    #             "daily_busyness",
    #             "daily_tasks_completed",
    #             "total_tasks_completed",
    #             "average_task_duration_(hours)",
    #             "average_hours_left_at_task_completion",
    #         ],
    #     )
    #     init_df.to_csv(path + f"/{handle}.csv", mode="w", index=False)

    #     with open(BASE_DIR + f"/reports/{handle}.json", "w") as output_report:
    #         output_report.write(json.dumps({"user": [], "projects": {}}, indent=2))

    # Add database entries to store user's achievement progress

    # user_id = conn.execute(
    #     "SELECT id FROM users WHERE email=?", (email,)
    # ).fetchone()[0]

    # achievements_data = conn.execute("SELECT id FROM achievements").fetchall()

    # for achievement_id in achievements_data:
    #     conn.execute(
    #         "INSERT INTO earned (user, achievement, achieved, progress) VALUES (?, ?, ?, ?)",
    #         (user_id, achievement_id[0], "FALSE", 0),
    #     )


def login_user(email, password):
    """
    Logs a user in by verifiyng their email and password. Raises error if either
    either field is incorrect

    Parameters:
    email (string): Verified Email (Format checked in Frontend)
    passwword (string): Verified Password (Strength checked in frontend)

    Returns:
    None
    """

    user = User()
    user.login(email, password)
    return user.handle
    # conn = get_db()
    # with conn:
    #     users = conn.execute(
    #         "SELECT * FROM users WHERE email = ? AND password = ?",
    #         (email, hashlib.sha256(password.encode()).hexdigest()),
    #     ).fetchall()

    #     if len(users) != 1:
    #         raise InputError(description="Invalid login credentials.")


def request_user_password_reset(email):
    """
    Checks if the user requeesting a password reset is a valid user, if so
    returns a random 4-digit code to be sent to the user's email

    Parameters:
    email (string): Verified Email (Format checked in Frontend)

    Returns:
    int: Random 4-digit code to be sent to user's email
    """
    conn = get_db()
    with conn:
        cur = conn.cursor()
        users = cur.execute("SELECT * FROM users where email = ?", (email,)).fetchall()
        if len(users) <= 0:
            raise InputError(description="Email not found.")

        return randint(1000, 9999)


def reset_user_password(email, password):
    """
    Checks if the user resseting the password is a valid user, if so
    resets the user's password to the new password

    Parameters:
    email (string): Verified Email (Format checked in Frontend)
    passwword (string): New Verified Password (Strength checked in frontend)

    Returns:
    None
    """
    conn = get_db()
    with conn:
        cur = conn.cursor()
        users = cur.execute("SELECT * FROM users where email = ?", (email,)).fetchall()
        if len(users) <= 0:
            raise InputError(description="Email not found.")

        cur.execute(
            "UPDATE users SET password=? WHERE email=?",
            (hashlib.sha256(password.encode()).hexdigest(), email),
        )
