from src.helpers import get_db


class Connection:
    def __init__(self, handle):
        self.handle = handle
        self.accepted = None
        self.incoming = None
        self.outgoing = None
        self.suggestions = None
        self.fetch()

    def query(self, conn_type, status):
        query = f"""
            SELECT u.handle
            FROM connections c
            JOIN users u 
            ON c.{conn_type} = u.handle
            WHERE (inviter = ? OR user = ?) 
            AND accepted = ?
        """
        with get_db() as conn:
            cur = conn.cursor()
            return [row["handle"] for row in cur.execute(query, status).fetchall()]
            res = []
            for row in cur.execute(query, status).fetchall():
                user = dict(row)
                user["busyness"] = 16  # TODO
                res.append(user)
            return res

    def fetch(self):
        types = {
            "accepted": (self.handle, None, "TRUE"),
            "incoming": (None, self.handle, "FALSE"),
            "outgoing": (self.handle, None, "FALSE"),
        }
        self.accepted = self.query("user", types["accepted"])
        self.incoming = self.query("inviter", types["incoming"])
        self.outgoing = self.query("user", types["outgoing"])
        self.suggest()

    def suggest(self):
        connections = list(self.accepted)
        connections.extend(list(self.incoming))
        connections.extend(list(self.outgoing))
        # connections = [conn["handle"] for conn in self.accepted]
        # connections.extend([conn["handle"] for conn in self.incoming])
        # connections.extend([conn["handle"] for conn in self.outgoing])
        # SELECT first_name || ' ' || last_name as name, handle, image, skills FROM users
        query = f"""
            SELECT handle FROM users 
            WHERE handle != ? 
            AND handle NOT IN ({','.join(['?' for _ in connections])})
        """
        with get_db() as conn:
            cur = conn.cursor()
            self.suggestions = [
                # dict(row)
                row["handle"]
                for row in cur.execute(query, [self.handle] + connections).fetchall()
            ]

    def request(self, target_handle):
        query = """
            INSERT INTO connections (inviter, user, accepted) 
            VALUES (?, ?, ?)
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, (self.handle, target_handle, "FALSE"))

        self.fetch()

    def accept(self, inviter_handle):
        query = """
            UPDATE connections SET accepted=? WHERE inviter=? AND user=?
        """
        sql = """
            INSERT INTO connections (inviter, user, accepted) 
            VALUES (?, ?, ?)
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, ("TRUE", inviter_handle, self.handle))
            cur.execute(sql, (self.handle, inviter_handle, "TRUE"))

        self.fetch()

    def delete(self, target_handle):
        query = """
            DELETE FROM connections WHERE inviter=? AND user=?
        """
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, (self.handle, target_handle))
            cur.execute(query, (target_handle, self.handle))
        self.fetch()
