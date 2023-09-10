from src.classes.project import Project
from src.classes.task import Task

PROJECTS_ACTIVE = {}
TASKS_ACTIVE = {}


def get_active_project(project_id) -> Project:
    return PROJECTS_ACTIVE[project_id] if project_id in PROJECTS_ACTIVE else None


def set_project_active(project_id: int, project: Project) -> None:
    PROJECTS_ACTIVE[project_id] = project


def get_active_task(task_id) -> Task:
    print(TASKS_ACTIVE)
    if task_id in TASKS_ACTIVE:
        return TASKS_ACTIVE[task_id]

    return Task(task_id)


def set_task_active(task_id: int, task: Task) -> None:
    task.is_edit = True
    TASKS_ACTIVE[task_id] = task


def delete_active_task(task_id) -> None:
    TASKS_ACTIVE.pop(task_id)
