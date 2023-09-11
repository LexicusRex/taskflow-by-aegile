DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS has;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS assigned;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS connections;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS earned;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS project_invites;
DROP TABLE IF EXISTS metrics;
DROP TABLE IF EXISTS task_metrics;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    password TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    skills TEXT,
    keywords TEXT,
    description TEXT,
    banner TEXT,
    image TEXT,
    raw_image TEXT,
    last_login TEXT
);

CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    creator TEXT NOT NULL,
    name TEXT NOT NULL,
    subheading TEXT,
    description TEXT,
    end_date TEXT,
    FOREIGN KEY(creator) REFERENCES users(handle) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS has (
    inviter TEXT NOT NULL,
    user TEXT NOT NULL,
    project INTEGER NOT NULL,
    role TEXT NOT NULL,
    accepted TEXT NOT NULL,
    FOREIGN KEY(user) REFERENCES users(handle),
    FOREIGN KEY(project) REFERENCES projects(id) ON DELETE CASCADE,
    PRIMARY KEY (user,project)
);

CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    project INTEGER NOT NULL,
    creator TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    deadline TEXT,
    status TEXT NOT NULL,
    attachment TEXT,
    attachment_name TEXT,
    weighting INTEGER,
    priority TEXT,
    busyness INTEGER NOT NULL,
    num_assignees INTEGER NOT NULL,
    time_start INTEGER NOT NULL,
    time_end INTEGER,
    complete_till_due INTEGER,
    FOREIGN KEY(project) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(creator) REFERENCES users(handle) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assigned (
    task INTEGER NOT NULL,
    user TEXT NOT NULL,
    FOREIGN KEY(task) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY(user) REFERENCES users(handle) ON DELETE CASCADE,
    PRIMARY KEY(task, user)
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY,
    task INTEGER NOT NULL,
    poster INTEGER NOT NULL,
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    replyId INTEGER,
    FOREIGN KEY(task) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY(poster) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS connections (
    inviter TEXT NOT NULL,
    user TEXT NOT NULL,
    accepted TEXT NOT NULL,
    FOREIGN KEY(inviter) REFERENCES users(handle),
    FOREIGN KEY(user) REFERENCES users(handle),
    PRIMARY KEY (inviter,user)
);

CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    requirement INTEGER NOT NULL,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS earned (
    user INTEGER NOT NULL,
    achievement INTEGER NOT NULL,
    achieved TEXT NOT NULL,
    progress INTEGER NOT NULL,
    FOREIGN KEY(user) REFERENCES users(id),
    FOREIGN KEY(achievement) REFERENCES achievements(id),
    PRIMARY KEY (user, achievement)
);

CREATE TABLE IF NOT EXISTS notifications (
    notif_id INTEGER PRIMARY KEY,
    recipient TEXT NOT NULL,
    sender TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    project INTEGER,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY(recipient) REFERENCES users(handle),
    FOREIGN KEY(sender) REFERENCES users(handle),
    FOREIGN KEY(project) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS project_invites (
    inviter TEXT NOT NULL,
    invitee TEXT NOT NULL,
    project INTEGER NOT NULL,
    FOREIGN KEY(inviter) REFERENCES users(id),
    FOREIGN KEY(invitee) REFERENCES users(id),
    FOREIGN KEY(project) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    project INTEGER NOT NULL,
    ceiling INTEGER,
    floor INTEGER,
    unit TEXT NOT NULL,
    unit_min INTEGER NOT NULL,
    unit_max INTEGER NOT NULL,
    flip INTEGER NOT NULL,
    negative INTEGER NOT NULL,
    n_value INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS task_metrics (
    task INTEGER NOT NULL,
    metric INTEGER NOT NULL,
    FOREIGN KEY(task) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY(metric) REFERENCES metrics(id) ON DELETE CASCADE,
    PRIMARY KEY (task, metric)
);
