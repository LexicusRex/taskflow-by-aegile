import hashlib
import random
from src.helpers import get_db, exec_query
from src.error import InputError


class User:
    def __init__(self, handle=None):
        self.u_id = None
        self.email = None
        self.first_name = None
        self.last_name = None
        self.password = None
        self.handle = None
        self.data = None
        self.fetch(handle)

    def fetch(self, handle):
        sql = """
            SELECT *, first_name || ' ' || last_name as name 
            FROM users 
            WHERE handle=?
        """

        if handle is None:
            return
        with get_db() as conn:
            cur = conn.cursor()
            user = cur.execute(sql, (handle,)).fetchone()
            if not user:
                raise InputError("User does not exist")
            self.u_id = user["id"]
            self.email = user["email"]
            self.first_name = user["first_name"]
            self.last_name = user["last_name"]
            self.password = user["password"]
            self.handle = user["handle"]
            self.data = dict(user)
            self.data["numConnections"] = self.count_stat(
                "connections", "user", self.u_id
            )

            self.data["numProjects"] = self.count_stat("has", "user", self.u_id)
            # HERE - placeholder
            self.data["busyness"] = 16

    def count_stat(self, table: str, field: str, input):
        sql = f"""
            SELECT COUNT(*) FROM {table} WHERE {field}=?
        """
        with get_db() as conn:
            cur = conn.cursor()
            return cur.execute(sql, (input,)).fetchone()["COUNT(*)"]

    def check_exists(self, email):
        sql = """
            SELECT * FROM users WHERE email=?
        """
        with get_db() as conn:
            cur = conn.cursor()
            user = cur.execute(sql, (email,)).fetchone()
            if not user:
                return False
            return True

    def login(self, email, password):
        sql = "SELECT * FROM users WHERE email = ? AND password = ?"
        res = exec_query(sql, (email, hashlib.sha256(password.encode()).hexdigest()))
        if len(res) == 0:
            raise InputError("Email or password is incorrect")
        self.fetch(res[0]["handle"])

    def register(self, email, password, first_name, last_name):
        if self.check_exists(email):
            raise InputError("User already exists")

        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.password = hashlib.sha256(password.encode()).hexdigest()
        self.handle = f"{first_name.replace(' ', '')}{last_name.replace(' ', '')}{random.randint(1000,9999)}"

        sql = """
            INSERT INTO users (email, first_name, last_name, password, handle, image, raw_image)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        exec_query(
            sql,
            (
                self.email,
                self.first_name,
                self.last_name,
                self.password,
                self.handle,
                "https://www.gstatic.com/images/branding/product/2x/avatar_square_blue_120dp.png",
                "https://www.gstatic.com/images/branding/product/2x/avatar_square_blue_120dp.png",
            ),
        )
        self.fetch(self.handle)

        # TODO - User metrics csv

    def edit_user(self, new_data):
        fields = {
            "email": "email",
            "firstName": "first_name",
            "lastName": "last_name",
            "skills": "skills",
            "description": "description",
            "image": "image",
            "rawImage": "raw_image",
            "banner": "banner",
        }
        if not self.data:
            return
        old_data = self.data
        with get_db() as conn:
            cur = conn.cursor()
            for field in fields.items():
                if new_data[field[0]] == old_data[field[1]]:
                    continue
                cur.execute(
                    f"UPDATE users SET {field[1]}=? WHERE handle=?",
                    (new_data[field[0]], self.handle),
                )

            new_password = hashlib.sha256(new_data["password"].encode()).hexdigest()
            if self.password != new_password:
                cur.execute(
                    "UPDATE users SET password=? WHERE handle=?",
                    (new_password, self.handle),
                )
        self.fetch(self.handle)
