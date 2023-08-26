from src.helpers import get_db
from src.error import InputError, AccessError
from src.classes.invite import Invite


class Project:
    @classmethod
    def get_all(cls, handle):
        query = """
            SELECT p.id
            FROM projects p
            JOIN has h
            ON p.id = h.project
            WHERE h.user = ? AND h.accepted='TRUE'
        """

        with get_db() as conn:
            cur = conn.cursor()
            project_ids = cur.execute(query, (handle,)).fetchall()
            all_projects = [Project(p_id["id"]).data for p_id in project_ids]
            return all_projects

    def __init__(self, project_id=None):
        self.creator = None
        self.p_id = project_id
        self.name = None
        self.subheading = None  # tentative
        self.description = None  # tentative
        self.end_date = None
        self.members = None
        self.data = None
        self.fetch()

    def fetch(self):
        query = """
            SELECT p.id, p.name, p.subheading, p.description, p.end_date
            FROM projects p
            WHERE p.id = ?
        """
        # JOIN has h
        # ON p.id = h.project
        # WHERE p.id = ? AND h.accepted='TRUE'
        if self.p_id is None:
            return

        with get_db() as conn:
            cur = conn.cursor()
            project = cur.execute(query, (self.p_id,)).fetchone()
            if not project:
                raise InputError(f"Project with id: {self.p_id} - does not exist")

            self.p_id = int(project["id"])
            self.name = project["name"]
            self.subheading = project["subheading"]
            self.description = project["description"]
            self.end_date = project["end_date"]
            self.data = dict(project)
            self.data["progress"] = 0  # TODO
            self.data["tasks"] = 0  # TODO
            curr_members = cur.execute(
                # SELECT u.handle
                """
                    SELECT u.handle, u.first_name || ' ' || u.last_name as name, u.skills, u.image, h.role
                    FROM users u
                    JOIN has h
                    ON u.handle = h.user
                    WHERE h.project = ? AND accepted='TRUE'
                """,
                (self.p_id,),
            ).fetchall()
            self.members = [dict(member_row) for member_row in curr_members]
            # self.members = [member_row["handle"] for member_row in curr_members]
            self.data["members"] = self.members

    def check_dupes(self, handle, name):
        with get_db() as conn:
            cur = conn.cursor()
            projects = cur.execute(
                "SELECT * FROM projects WHERE creator = ? AND name = ?", (handle, name)
            ).fetchall()
            if len(projects) > 0:
                raise InputError(
                    "User has already created a project with the same name."
                )

    def check_permission(self, handle, role):
        if not self.p_id:
            raise InputError("Project ID not given")
        with get_db() as conn:
            cur = conn.cursor()
            res = cur.execute(
                "SELECT role FROM has WHERE user = ? AND project = ?",
                (handle, self.p_id),
            ).fetchone()["role"]

            if res != role:
                raise AccessError(f"Only {role}s have access.")

    def pending_invites(self):
        query = """
            SELECT u.handle
            FROM users u
            JOIN has h
            ON u.handle = h.user
            WHERE h.project = ?
            AND accepted='FALSE'
        """

        # Add each member into the project
        with get_db() as conn:
            cur = conn.cursor()
            return [
                invite["handle"]
                for invite in cur.execute(query, (self.p_id,)).fetchall()
            ]

    def invite_project_members(self, inviter_handle, members):
        if not self.p_id:
            raise InputError("Project ID not given")
        self.check_permission(inviter_handle, ("creator" or "admin"))
        for invitee_handle in members:
            if invitee_handle in self.members:
                raise InputError(
                    f"{invitee_handle} is already a member of the project."
                )

            Invite(inviter_handle, "has").send(
                ["inviter", "user", "project", "role", "accepted"],
                (inviter_handle, invitee_handle, self.p_id, "member", "FALSE"),
            )
            # cur.execute(query, (invitee_handle,))

            # User(invitee_handle).handle

        # Add a csv file to store task analytics for the project and its members

    def new(self, creator_handle, name, subheading, description, end_date, members):
        self.check_dupes(creator_handle, name)
        # Add new project to projects table
        new_proj_query = """
            INSERT INTO projects 
            (creator, name, subheading, description, end_date) 
            VALUES (?, ?, ?, ?, ?)
        """
        creator_query = """
            INSERT INTO has (inviter, user, project, role, accepted) 
            VALUES (?, ?, ?, ?, ?)
        """
        self.creator = creator_handle
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                new_proj_query, (self.creator, name, subheading, description, end_date)
            )
            self.p_id = int(cur.lastrowid)
            print(f"{self.p_id=}")
            # Add creator of project into the has table (automatically admin)
            cur.execute(
                creator_query,
                (self.creator, self.creator, self.p_id, "creator", "TRUE"),
            )
        self.fetch()
        self.invite_project_members(self.creator, members)

    def edit(self, creator_handle, data):
        query = """
            UPDATE projects 
            SET name = ?, subheading = ?, description = ?, end_date = ? 
            WHERE id = ?
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                query,
                (
                    data["name"],
                    data["subheading"],
                    data["description"],
                    data["end_date"],
                    data["project_id"],
                ),
            )
        self.invite_project_members(creator_handle, data["members"])
        self.fetch()

    def delete(self, creator_handle):
        if not self.p_id:
            raise InputError("Project ID not given")
        query = "DELETE FROM projects WHERE id = ?"
        self.check_permission(creator_handle, "creator")
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, (self.p_id,))
            conn.commit()
            projects = cur.execute("SELECT * FROM has").fetchall()
            for project in projects:
                print(tuple(project))

    def get_members(self, handle):
        query = """
            SELECT u.email, u.handle, u.first_name || ' ' || u.last_name as name, u.skills, u.keywords, u.image 
            FROM has h 
            JOIN users u 
            ON h.user = u.handle 
            WHERE h.project = ? AND h.accepted='TRUE'
            ORDER BY u.handle = ? DESC
        """
        if not self.p_id:
            return {}
        project_members = {}
        with get_db() as conn:
            cur = conn.cursor()
            members = cur.execute(query, (self.p_id, handle)).fetchall()
            for member in members:
                project_members[member["handle"]] = {
                    "name": member["name"],
                    "skills": member["skills"],
                    "keywords": dict.fromkeys(member["keywords"].split(","), True)
                    if member["keywords"]
                    else {},
                    "image": member["image"],
                    "handle": member["handle"],
                    # "busyness": calc_total_busyness(member["email"]),
                    "busyness": 16,
                    "assigned": False,
                }

            return project_members

    def get_invites(self, handle, user_type):
        # user_types = "inviter" or "invitee"
        query = f"""
            SELECT u.handle, u.image, p.id, p.name
            FROM users u
            JOIN project_invites pi
            ON u.handle = pi.invitee
            JOIN projects p
            ON p.id = pi.project
            WHERE pi.{user_type} = ?
        """
        with get_db() as conn:
            cur = conn.cursor()
            invites = cur.execute(query, (handle,)).fetchall()
            return [
                {
                    "handle": invite["handle"],
                    "image": invite["image"],
                    "projectId": invite["id"],
                    "projectName": invite["name"],
                }
                for invite in invites
            ]

    def remove_member(self, member_handle):
        if not self.p_id:
            return
        query = """
            DELETE FROM has
            WHERE user=? 
            AND project=? AND accepted='TRUE'
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, (member_handle, self.p_id))

    def get_role(self, handle):
        query = """
            SELECT role
            FROM has
            where user = ? AND project = ?
        """
        with get_db() as conn:
            cur = conn.cursor()
            role = cur.execute(query, (handle, self.p_id)).fetchone()["role"]
            return role

    def change_permissions(self, user_handle, target_handle):
        user_role = self.get_role(user_handle)
        target_role = self.get_role(target_handle)
        # Only creator can manage roles. Admins can invite and kick members.
        if user_role != "creator":
            raise AccessError("Only the project creator may change user permissions.")
        if target_role == "creator":
            raise InputError("Creator permissions cannot be changed.")

        new_role = "member" if target_role == "admin" else "admin"
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(
                "UPDATE has SET role = ? WHERE user = ? AND project = ?",
                (new_role, target_handle, self.p_id),
            )
