from src.helpers import get_db, add_notification, update_achievement
from src.error import InputError
from src.performance import calc_total_busyness
from src.classes.connection import Connection
from src.classes.user import User
from pprint import pprint


def get_user_connections(handle):
    # TODO - docstrings

    connections = Connection(handle)
    temp = {
        "accept": [User(handle).data for handle in connections.incoming],
        "pending": [User(handle).data for handle in connections.outgoing],
        "connected": [User(handle).data for handle in connections.accepted],
        "suggestions": [User(handle).data for handle in connections.suggestions],
    }
    return temp


def accept_connection_request(handle, inviter_handle):
    # TODO - docstrings
    Connection(handle).accept(inviter_handle)

    # Achievements:
    # update_achievement("Not Alone", user_id)
    # update_achievement("Not Alone", inviter_id)
    # update_achievement("Networker", user_id)
    # update_achievement("Networker", inviter_id)
    # update_achievement("Social Butterfly", user_id)
    # update_achievement("Social Butterfly", inviter_id)

    # add_notification(
    #     inviter_email,
    #     user_handle,
    #     "connection",
    #     "accept",
    #     "accepted your connection request.",
    #     None,
    # )
    return {}


def create_connection_request(handle, target_handle):
    # TODO - docstrings
    Connection(handle).request(target_handle)

    # add_notification(
    #     target_email,
    #     user_handle,
    #     "connection",
    #     "request",
    #     "wants to connect.",
    #     None,
    # )
    return {}


def delete_user_connection(handle, target_handle):
    # TODO - docstrings
    Connection(handle).delete(target_handle)

    # add_notification(
    #     target_email,
    #     user_handle,
    #     "connection",
    #     "delete",
    #     "deleted your connection.",
    #     None,
    # )
    return {}


# def get_all_connections(project_id, user_id):
#     """
#     Retrieves all current connections of a user within the same project

#     Parameters:
#     email (string): Verified Email (Format checked in Frontend)
#     project_id (int): Id of a project

#     Returns:
#     List: A list of dictionaries where each dictonary contains details of a
#     connection
#     """
#     with get_db() as conn:
#         cur = conn.cursor()

#         project_members = {}
#         project_members_data = cur.execute(
#             """
#             SELECT u.email, u.handle, u.first_name, u.last_name, u.skills, u.keywords, u.image
#             FROM has h
#             JOIN users u
#             ON h.user = u.id
#             WHERE h.project = ?
#             ORDER BY u.id = ? DESC
#             """,
#             (project_id, user_id),
#         ).fetchall()

#         for member in project_members_data:
#             project_members[member["handle"]] = {
#                 "name": f"{member['first_name']} {member['last_name']}",
#                 "skills": member["skills"],
#                 "keywords": dict.fromkeys(member["keywords"].split(","), True)
#                 if member["keywords"]
#                 else {},
#                 "image": member["image"],
#                 "handle": member["handle"],
#                 "busyness": calc_total_busyness(member["email"]),
#                 "assigned": False,
#             }

#     return project_members
