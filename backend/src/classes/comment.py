from time import time
from src.helpers import get_db
from pprint import pprint
class Comment:
    @classmethod
    def get_all(cls, task_id):
        query = """
            SELECT 
                c.id, 
                c.text, 
                u.handle as poster, 
                u.first_name || ' ' || u.last_name as name, 
                c.time, 
                c.reply_id 
            FROM comments c
            JOIN users u 
            ON u.handle = c.poster
            WHERE c.task = ?
            ORDER BY c.time ASC
        """
        with get_db() as conn:
            cur = conn.cursor()
            comments = cur.execute(query, (task_id,)).fetchall()
            cmnt_list = []
            cmnt_map = {}
            cmnt_idx = 0

            for comment in comments:
                if comment["reply_id"] == -1:
                    cmnt_list.append(dict(comment))
                    cmnt_map[comment["id"]] = cmnt_idx
                    cmnt_idx += 1
                    continue
                parent = cmnt_list[cmnt_map.get(comment["reply_id"], None)]
                if "replies" not in parent:
                    parent["replies"] = []
                parent["replies"].append(dict(comment))

            print('new')
            pprint(cmnt_list, indent=4)



    def __init__(self, task_id, comment_id=None):
        self.t_id = task_id
        self.c_id = comment_id

    def new(self, handle, text, reply):
        query = f"""
            INSERT INTO comments 
            (task, poster, text, time, reply_id) 
            VALUES (?, ?, ?, ?, ?)
        """
        print(self.t_id, handle, text, reply)
        with get_db() as conn:
            cur = conn.cursor()
            cur.execute(query, (self.t_id, handle, text, time(), reply))
            conn.commit()

