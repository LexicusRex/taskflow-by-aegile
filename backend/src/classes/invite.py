from src.helpers import get_db
from src.error import InputError


class Invite:
    def __init__(self, handle, table):
        self.handle = handle
        self.table = table

    def get(self, counter_role, my_invite_role, pinpoint_field=None, alias=""):
        query = f"""
            SELECT u.handle, u.image {f', a.{pinpoint_field} as {alias}' if pinpoint_field else ""}
            FROM users u
            JOIN {self.table} a
            ON u.handle = a.{counter_role}
            WHERE a.{my_invite_role} = ?
            AND accepted='FALSE'
        """
        with get_db() as conn:
            cur = conn.cursor()
            invites = cur.execute(query, (self.handle,)).fetchall()

            return [dict(invite) for invite in invites]

    def send(self, fields, values):
        query = f"""
            INSERT INTO {self.table} ({', '.join(fields)}) 
            VALUES ({','.join(['?' for _ in fields])})
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, values)

    def accept(self, pinpoint_field, pinpoint_value, reverse=False):
        query = f"""
            UPDATE {self.table} SET accepted=? 
            WHERE {pinpoint_field}=? AND user=?
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, ("TRUE", pinpoint_value, self.handle))

            if not reverse:
                return
            sql = f"""
                INSERT INTO {self.table} ({pinpoint_field}, user, accepted) 
                VALUES (?, ?, ?)
            """
            cur.execute(sql, (self.handle, pinpoint_value, "TRUE"))

    def delete(self, inviter, invitee, pinpoint_field, pinpoint_value):
        query = f"""
            DELETE FROM {self.table}
            WHERE inviter=? AND user=? 
            AND {pinpoint_field}=? AND accepted='FALSE'
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, (inviter, invitee, pinpoint_value))
