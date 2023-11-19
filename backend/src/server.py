import os.path
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
from json import dumps, load
from src.error import InputError, AccessError
from src.helpers import get_db, decode_token, add_notification
from src.notifications import add_task_notification
import time
import datetime as datetime
from flask_apscheduler import APScheduler
from src.__config__ import ANALYTICS_TIMESPAN
from src.classes.user import User
import jwt

from flask_mail import Mail, Message
import logging

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

from src.auth import (
    register_new_user,
    login_user,
    request_user_password_reset,
    reset_user_password,
)

from src.project_operations import (
    add_project,
    edit_project,
    delete_project,
    get_projects,
    get_project,
    get_project_members,
    get_all_project_members,
    invite_users,
    accept_invite,
    delete_invite,
    get_invites,
    remove_member,
    update_member_permissions,
)

from src.users import get_user, edit_profile, get_user_from_handle, get_achievements

from src.connections import (
    get_user_connections,
    accept_connection_request,
    create_connection_request,
    delete_user_connection,
    # get_all_connections,
)
from src.task_operations import (
    create_task,
    delete_task,
    get_task,
    get_all_tasks,
    update_task_specs,
    get_user_tasks,
    task_comment,
    task_get_comment,
    get_task_content,
    update_task_edit,
    task_update_status,
    set_task_editor_index,
    task_set_as_subtask,
    task_remove_as_subtask,
    get_task_edit_history,
)

from src.analytics import (
    update_analytics,
    get_performance_analytics,
    get_project_analytics,
    get_user_project_contribution,
    get_user_line_data,
    get_project_member_contributions,
)

from src.dashboard import (
    get_dashboard_connections,
    get_dashboard_tasks,
    get_dashboard_task_chart,
    get_overview,
)

from src.feedback import generate_new_user_report, generate_new_project_report

log = logging.getLogger("werkzeug")
log.setLevel(logging.ERROR)

SECRET = "agas4g5H6jkgh@oHJug!a%"


def defaultHandler(err):
    response = err.get_response()
    response.data = dumps(
        {
            "code": err.code,
            "name": "System Error",
            "message": err.get_description(),
        }
    )
    response.content_type = "application/json"
    return response


APP = Flask(__name__, static_url_path="/static/")
CORS(APP)

APP.config["TRAP_HTTP_EXCEPTIONS"] = True
APP.register_error_handler(Exception, defaultHandler)


def encode_token(target, type="email"):
    # Login, Register
    return jwt.encode({type: target}, SECRET, algorithm="HS256")


def check_auth(token, token_type="email"):
    try:
        target = jwt.decode(token, SECRET, algorithms=["HS256"])[token_type]
        conn = get_db()
        users = conn.execute(
            f"SELECT * FROM users WHERE {token_type} = ?", (target,)
        ).fetchall()

        if len(users) <= 0:
            conn.close()
            return False
            raise AccessError(description="Invalid token.")
        return True
    except Exception as ex:
        # token is invalid
        return False


@APP.route("/api", methods=["GET"])
def index():
    return {"name": "Alex", "age": 20}


SWAGGER_URL = "/swagger"
API_URL = "http://localhost:5000/swagger.json"
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL, API_URL, config={"app_name": "TaskFlow"}
)
APP.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)


def token_auth(func):
    def inner():
        token = request.headers.get("Authorization").split()[1]
        if not check_auth(token, "handle"):
            raise AccessError("Invalid token")
        handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]
        return func(handle)

    inner.__name__ = func.__name__
    return inner


# To access the swagger page, go to http://localhost:5000/swagger
@APP.route("/swagger.json")
def swagger():
    with open("src/swagger.json", "r") as f:
        return jsonify(load(f))


@APP.route("/auth/register", methods=["POST"])
def auth_register():
    reg_data = request.get_json()
    handle = register_new_user(
        reg_data["email"],
        reg_data["password"],
        reg_data["firstName"],
        reg_data["lastName"],
    )
    return dumps({"token": encode_token(handle, "handle")})


@APP.route("/auth/login", methods=["POST"])
def auth_login():
    login_data = request.get_json()
    handle = login_user(login_data["email"], login_data["password"])

    # with get_db() as conn:
    #     cur = conn.cursor()
    #     cur.execute(
    #         "UPDATE users SET last_login=? WHERE email=?",
    #         (int(time.time()), login_data["email"]),
    #     )
    # add_task_notification(login_data["email"])

    return dumps({"token": encode_token(handle, "handle")})


APP.config["MAIL_SERVER"] = "smtp.gmail.com"
APP.config["MAIL_PORT"] = 465
APP.config["MAIL_USERNAME"] = "taskflow.helicopters@gmail.com"
APP.config["MAIL_PASSWORD"] = "kwpbzyoehylhhrpo"
APP.config["MAIL_USE_TLS"] = False
APP.config["MAIL_USE_SSL"] = True
mail = Mail(APP)

active_reset_codes = {}


@APP.route("/auth/pasword/requestreset", methods=["POST"])
def auth_request_password_reset():
    user_email = request.get_json()["email"]
    verification_code = request_user_password_reset(user_email)
    active_reset_codes[user_email] = f"{verification_code}"
    msg = Message(
        "TaskFlow - Password Reset Request",
        sender="taskflow@gmail.com",
        recipients=[user_email],
    )
    msg.body = f"The code for your TaskFlow password reset is {verification_code}"
    mail.send(msg)

    return dumps({})


@APP.route("/auth/pasword/reset", methods=["POST"])
def auth_reset_password():
    user_email = request.get_json()["email"]
    reset_code = request.get_json()["code"]
    new_password = request.get_json()["newPassword"]
    if user_email not in active_reset_codes:
        raise InputError("Invalid reset code")

    if active_reset_codes[user_email] != reset_code:
        raise InputError(description="Invalid password reset code.")
    reset_user_password(user_email, new_password)
    return dumps({})


# =============================================================================
#                                   User
# =============================================================================


@APP.route("/profile", methods=["GET"])
@token_auth
def get_profile(handle):
    return dumps(get_user(handle))


@APP.route("/user", methods=["GET"])
def get_profile_from_handle():
    token = request.headers.get("Authorization").split()[1]
    handle = request.args["handle"]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    return dumps(get_user_from_handle(handle))


@APP.route("/profile/edit", methods=["PUT"])
def profile_edit():
    # User is able to edit first name, last name, job position, profile image
    # and skills. First name and last name must not be empty!
    profile_data = request.get_json()
    try:
        token = request.headers.get("Authorization").split()[1]

        if not check_auth(token, "handle"):
            raise AccessError("Invalid token")
        handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

        # if not profile_data["firstName"]:
        #     raise InputError(description="First name cannot be empty.")
        # if not profile_data["lastName"]:
        #     raise InputError(description="Last name cannot be empty.")
        edit_profile(handle, profile_data)
        # user_token = encode_token(new_handle)
        return dumps({})
        # return dumps({"token": user_token})
    except AttributeError as exc:
        raise InputError("Token not given") from exc


# =============================================================================
#                                   Project
# =============================================================================


@APP.route("/project", methods=["GET"])
@token_auth
def user_projects(handle):
    projs = get_projects(handle)
    return dumps(projs)


@APP.route("/project/new", methods=["POST"])
def project_new():
    try:
        project_data = request.get_json()
        token = request.headers.get("Authorization").split()[1]
        if not check_auth(token, "handle"):
            raise AccessError("Invalid token")
        handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

        return dumps(add_project(handle, project_data))
    except AttributeError as exc:
        raise InputError("Token not given") from exc


@APP.route("/project/edit", methods=["PUT"])
def project_edit():
    project_data = request.get_json()
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]
    return dumps(edit_project(handle, project_data))


@APP.route("/project/delete", methods=["DELETE"])
def project_delete():
    project_data = request.get_json()
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(delete_project(handle, project_data["projectId"]))


@APP.route("/project/specific", methods=["GET"])
def user_get_projects():
    project_id = request.args["projectId"]
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]
    return dumps(get_project(handle, project_id))


@APP.route("/project/members", methods=["GET"])
def project_members():
    project_id = request.args["projectId"]
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]
    return dumps(get_project_members(handle, project_id))


@APP.route("/project/invite", methods=["POST"])
def project_invite():
    invite_data = request.get_json()
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(invite_users(handle, invite_data["projectId"], invite_data["members"]))


@APP.route("/project/invite", methods=["GET"])
def get_project_invites():
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(get_invites(handle))


@APP.route("/project/invite", methods=["PUT"])
def accept_project_invite():
    invite_data = request.get_json()
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(accept_invite(handle, invite_data["handle"], invite_data["projectId"]))


@APP.route("/project/invite", methods=["DELETE"])
def delete_project_invite():
    invite_data = request.get_json()
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(delete_invite(handle, invite_data["projectId"], invite_data["handle"]))


@APP.route("/project/leave", methods=["DELETE"])
def project_leave():
    data = request.get_json()
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(remove_member(handle, data["projectId"], data["handle"]))


@APP.route("/project/permissions", methods=["PUT"])
def change_permissions():
    data = request.get_json()
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(update_member_permissions(handle, data["projectId"], data["handle"]))


# =============================================================================
#                                   Tasks
# =============================================================================


@APP.route("/task/create", methods=["POST"])
@token_auth
def do_create_task(handle):
    data = request.get_json()
    create_task(handle, data)
    return dumps({})


@APP.route("/task/delete", methods=["DELETE"])
@token_auth
def do_delete_task(handle):
    task_id = request.args["taskId"]
    delete_task(handle, task_id)
    return dumps({})


@APP.route("/task/get", methods=["GET"])
@token_auth
def do_get_task(handle):
    task_id = request.args["taskId"]
    return dumps(get_task(task_id))

@APP.route("/task/get/all", methods=["GET"])
@token_auth
def do_get_all_tasks(handle):
    project_id = request.args["projectId"]
    return dumps(get_all_tasks(project_id))


@APP.route("/task/update/specs", methods=["PUT"])
def do_update_task_specs():
    data = request.get_json()
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]
    # ###### REMOVE THIS LATER ######
    # if "assignees" not in data:
    #     data["assignees"] = []
    # ################################

    update_task_specs(handle, data)
    return dumps({})


@APP.route("/task", methods=["GET"])
def do_get_user_tasks():
    handle = request.args.get("handle")
    token = request.headers.get("Authorization").split()[1]

    if not check_auth(token):
        raise AccessError("Invalid token")
    # email = jwt.decode(token, SECRET, algorithms=["HS256"])["email"]

    # if handle is None:
    #     return dumps(get_user_tasks(email, False))
    # else:
    #     return dumps(get_user_tasks(handle, True))


@APP.route("/task/comment", methods=["POST"])
@token_auth
def do_task_comment(handle):
    data = request.get_json()
    task_comment(handle, data["taskId"], data["text"], data["repliedCommentId"])
    return dumps({})


@APP.route("/task/get/comment", methods=["GET"])
@token_auth
def do_task_get_comment(handle):
    task_id = request.args["taskId"]
    return dumps(task_get_comment(task_id))

@APP.route("/task/get/content", methods=["GET"])
@token_auth
def fetch_task_content(handle):
    project_id = request.args["projectId"]
    return dumps(get_task_content(project_id))

@APP.route("/task/edit/content", methods=["PUT"])
@token_auth
def edit_task_content(handle):
    task_id = request.args["taskId"]
    data = request.get_json()
    return dumps(update_task_edit(task_id, data["blocks"]))

@APP.route("/task/edit/history", methods=["GET"])
@token_auth
def task_edit_history(handle):
    task_id = request.args["taskId"]
    return dumps(get_task_edit_history(task_id))


@APP.route("/task/update/status", methods=["PUT"])
@token_auth
def update_task_status(handle):
    task_id = request.args["taskId"]
    status = request.args["status"]
    return dumps(task_update_status(handle, task_id, status))

@APP.route("/task/set/index", methods=["PUT"])
@token_auth
def set_task_index(handle):
    task_id = request.args["taskId"]
    parent_id = request.args["parentId"]
    project_id = request.args["projectId"]
    return dumps(set_task_editor_index( project_id, task_id, parent_id))

@APP.route("/task/set/subtask", methods=["PUT"])
@token_auth
def set_task_subtask(handle):
    task_id = request.args["taskId"]
    parent_id = request.args["parentId"]
    return dumps(task_set_as_subtask(handle, task_id, parent_id))

@APP.route("/task/remove/subtask", methods=["PUT"])
@token_auth
def remove_task_subtask(handle):
    task_id = request.args["taskId"]
    status = request.args["status"]
    return dumps(task_remove_as_subtask(handle, task_id, status))


# =============================================================================
#                                   Connections
# =============================================================================
@APP.route("/connections", methods=["GET"])
def get_connections():
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")

    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(get_user_connections(handle))


@APP.route("/connections/task", methods=["GET"])
def get_task_connections():
    project_id = request.args["projectId"]
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]
    return dumps(get_all_project_members(handle, project_id))


@APP.route("/connections", methods=["PUT"])
def accept_connection():
    inviter_handle = request.get_json()["handle"]
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")

    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(accept_connection_request(handle, inviter_handle))


@APP.route("/connections", methods=["POST"])
def request_connection():
    target_handle = request.get_json()["target"]
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")

    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(create_connection_request(handle, target_handle))


@APP.route("/connections", methods=["DELETE"])
def delete_connection():
    target_handle = request.get_json()["target"]
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")

    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(delete_user_connection(handle, target_handle))


# =============================================================================
#                                   Notifications
# =============================================================================
@APP.route("/notify", methods=["POST"])
def notify():
    data = request.get_json()
    token = request.headers.get("Authorization").split()[1]

    if not check_auth(token):
        raise AccessError("Invalid token")
    email = jwt.decode(token, SECRET, algorithms=["HS256"])["email"]
    # add_notification(
    #     email,
    #     "alexxu123",
    #     data["message"],
    #     "task",
    #     "You have been assigned to a new task!",
    # )

    return dumps({})


@APP.route("/notifications", methods=["GET"])
def get_notifications():
    token = request.headers.get("Authorization").split()[1]

    if not check_auth(token, "handle"):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]
    email = User(handle).email
    with get_db() as conn:
        notifications = conn.execute(
            "SELECT * FROM notifications WHERE recipient = ? AND timestamp >= ?",
            (email, time.time() - 2),
        ).fetchall()

        notif_obj = []
        for notif in notifications:
            notif_obj.append(
                {
                    "sender": notif["sender"],
                    "type": notif["type"],
                    "status": notif["status"],
                    "message": notif["message"],
                    "project": notif["project"],
                }
            )

    return dumps(notif_obj)


@APP.route("/notifications/all", methods=["GET"])
def get_all_notifications():
    token = request.headers.get("Authorization").split()[1]

    if not check_auth(token):
        raise AccessError("Invalid token")
    email = jwt.decode(token, SECRET, algorithms=["HS256"])["email"]
    with get_db() as conn:
        notifications = conn.execute(
            "SELECT * FROM notifications WHERE recipient = ? ORDER BY timestamp DESC",
            (email,),
        ).fetchall()

        notif_obj = []
        for notif in notifications:
            notif_obj.append(
                {
                    "id": notif["notif_id"],
                    "sender": notif["sender"],
                    "type": notif["type"],
                    "status": notif["status"],
                    "message": notif["message"],
                    "project": notif["project"],
                    "timestamp": notif["timestamp"],
                }
            )

    return dumps(notif_obj)


@APP.route("/notifications/all/delete", methods=["DELETE"])
def delete_all_notifications():
    token = request.headers.get("Authorization").split()[1]

    if not check_auth(token):
        raise AccessError("Invalid token")
    email = jwt.decode(token, SECRET, algorithms=["HS256"])["email"]
    with get_db() as conn:
        conn.execute(
            "DELETE FROM notifications WHERE recipient = ?",
            (email,),
        )
    return dumps({})


@APP.route("/notifications/delete", methods=["DELETE"])
def delete_notifications():
    notification_id = request.args["notificationId"]
    token = request.headers.get("Authorization").split()[1]

    if not check_auth(token):
        raise AccessError("Invalid token")
    email = jwt.decode(token, SECRET, algorithms=["HS256"])["email"]
    with get_db() as conn:
        conn.execute(
            "DELETE FROM notifications WHERE recipient = ? AND notif_id = ?",
            (email, notification_id),
        )
    return dumps({})


# =============================================================================
#                                   Analytics
# =============================================================================


@APP.route("/analytics/performance", methods=["GET"])
@token_auth
def performance_analytics(handle):
    daily_tasks, total_tasks, busyness, completion_time, till_due = get_user_line_data(
        handle
    )
    return dumps(
        {
            "user": get_performance_analytics(handle),
            "projectContributions": get_user_project_contribution(handle),
            "taskCompletions": daily_tasks,
            "totalTaskCompletions": total_tasks,
            "dailyBusyness": busyness,
            "avgCompletionDuration": completion_time,
            "avgTimeTillDue": till_due,
        }
    )


@APP.route("/analytics/project", methods=["GET"])
@token_auth
def project_analytics(handle):
    project_id = request.args["projectId"]
    return dumps(get_project_member_contributions(handle, project_id))


# =============================================================================
#                                   Dashboard
# =============================================================================
@APP.route("/dashboard", methods=["GET"])
@token_auth
def get_dashboard(handle):
    return dumps(
        {
            "connections": get_dashboard_connections(handle),
            "tasks": get_dashboard_tasks(handle),
            "chart": get_dashboard_task_chart(handle),
        }
    )


@APP.route("/dashboard/overview", methods=["GET"])
@token_auth
def do_get_overview(handle):
    return dumps(get_overview(handle))


# =============================================================================
#                                   Achievements
# =============================================================================
@APP.route("/achievements", methods=["GET"])
def do_get_achievements():
    token = request.headers.get("Authorization").split()[1]
    # handle = request.args["handle"]
    if not check_auth(token):
        raise AccessError("Invalid token")
    handle = jwt.decode(token, SECRET, algorithms=["HS256"])["handle"]

    return dumps(get_achievements(handle))


@APP.route("/achievements/user", methods=["GET"])
def do_get_auth_user_achievements():
    token = request.headers.get("Authorization").split()[1]
    if not check_auth(token):
        raise AccessError("Invalid token")
    email = jwt.decode(token, SECRET, algorithms=["HS256"])["email"]
    with get_db() as conn:
        cur = conn.cursor()
        handle = cur.execute(
            "SELECT handle FROM users WHERE email = ?", (email,)
        ).fetchone()[0]

    return dumps(get_achievements(handle))


# =============================================================================
#                                   Feedback
# =============================================================================
@APP.route("/feedback/user", methods=["POST"])
@token_auth
def generate_user_feedback_report(handle):
    data = request.get_json()
    return dumps(generate_new_user_report(handle))


@APP.route("/feedback/project", methods=["POST"])
@token_auth
def generate_project_feedback_report(handle):
    data = request.get_json()
    return dumps(
        generate_new_project_report(data["projectId"], data["projectName"], handle)
    )


@APP.route("/feedback/reports", methods=["GET"])
@token_auth
def get_feedback_reports(handle):
    with open(BASE_DIR + f"/reports/{handle}.json", "r", encoding="utf8") as f:
        return dumps(load(f))


scheduler = APScheduler()


# @scheduler.task(
#     "cron", id="update_analytics", year="*", month="*", day="*", hour="14", minute="0"
# )
@scheduler.task("interval", id="update_analytics", minutes=(ANALYTICS_TIMESPAN // 60))
def schedule_update():
    update_analytics()
    pass


if __name__ == "__main__":
    scheduler.init_app(APP)
    scheduler.start()
    # APP.run(debug=True, host="0.0.0.0", port=5000)

    # use the following for final tests before submission.
    APP.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)
