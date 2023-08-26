import os.path
import json
import pandas as pd
from datetime import datetime
from zoneinfo import ZoneInfo
from src.__config__ import DATA_PERSISTENCE, ANALYTICS_TIMESPAN
from src.helpers import get_db
from src.error import InputError

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Performance:
    def __init__(self, handle):
        self.handle = handle

    def get_datetime(self):
        curr_date = datetime.now(ZoneInfo("Australia/Sydney")).strftime("%H:%M")
        if ANALYTICS_TIMESPAN == 86400:
            curr_date = datetime.now(ZoneInfo("Australia/Sydney")).strftime("%d/%m/%Y")
        return curr_date

    def new_user(self):
        if not DATA_PERSISTENCE:
            # Create directory to store user's analytics
            path = os.path.join(BASE_DIR, "../analytics/users")

            init_data = [[self.get_datetime(), 0, 0, 0, 0, 0]]
            init_df = pd.DataFrame(
                data=init_data,
                columns=[
                    "date",
                    "daily_busyness",
                    "daily_tasks_completed",
                    "total_tasks_completed",
                    "average_task_duration_(hours)",
                    "average_hours_left_at_task_completion",
                ],
            )
            init_df.to_csv(path + f"/{self.handle}.csv", mode="w", index=False)

            with open(
                BASE_DIR + f"/../reports/{self.handle}.json", "w", encoding="utf-8"
            ) as output_report:
                output_report.write(json.dumps({"user": [], "projects": {}}, indent=2))

    def new_project(self, project_id):
        # Add a csv file to store task analytics for the project and its members
        path = os.path.join(BASE_DIR, "../analytics/projects")
        new_data = [[self.get_datetime(), 0, 0, 0]]
        new_df = pd.DataFrame(
            data=new_data,
            columns=[
                "date",
                self.handle,
                "total_tasks_completed",
                "daily_tasks_completed",
            ],
        )
        new_df.to_csv(path + f"/{project_id}.csv", mode="w", index=False)

    def new_project_member(self, project_id):
        path = os.path.join(BASE_DIR, "../analytics/projects")
        curr_df = pd.read_csv(path + f"/{project_id}.csv")
        num_rows = len(curr_df)
        num_cols = len(curr_df.columns)
        row_entries = [-1] * (num_rows - 1)
        row_entries.append(0)
        curr_df.insert(num_cols - 2, self.handle, row_entries)
        curr_df.to_csv(path + f"/{project_id}.csv", mode="w", index=False)

    def remove_project_member(self, project_id):
        path = os.path.join(BASE_DIR, "../analytics/projects")
        curr_df = pd.read_csv(path + f"/{project_id}.csv")
        curr_df.drop(self.handle, axis=1, inplace=True)
        curr_df.to_csv(path + f"/{project_id}.csv", mode="w", index=False)
