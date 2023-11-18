import os.path
import shutil

from src.__config__ import DATA_PERSISTENCE
from src.database.init_db import initialise_db


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_PATH = os.path.join(BASE_DIR, "analytics/users/")
PROJECTS_PATH = os.path.join(BASE_DIR, "analytics/projects/")
REPORTS_PATH = os.path.join(BASE_DIR, "reports/")
TASKS_PATH = os.path.join(BASE_DIR, "task_specs/")
DOCUMENTS_PATH = os.path.join(BASE_DIR, "task_content/")


def delete_directory_contents(dir_path, file_type=".csv"):
    for content in os.listdir(dir_path):
        content_path = os.path.join(dir_path, content)
        try:
            if os.path.isfile(content_path) and file_type in content_path:
                os.unlink(content_path)
            elif os.path.isdir(content_path):
                shutil.rmtree(content_path)
        except OSError as err:
            print(f"ERROR. Could not delete {content_path} due to {err}.")


def initialise_analytics():
    delete_directory_contents(USERS_PATH)
    delete_directory_contents(PROJECTS_PATH)
    delete_directory_contents(REPORTS_PATH, ".json")
    delete_directory_contents(TASKS_PATH, ".json")
    delete_directory_contents(DOCUMENTS_PATH, ".json")


if not DATA_PERSISTENCE:
    initialise_analytics()
    initialise_db()
