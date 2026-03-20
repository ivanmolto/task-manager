-- Create separate databases for each service
CREATE DATABASE taskmanager_auth;
CREATE DATABASE taskmanager_tasks;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE taskmanager_auth TO taskmanager;
GRANT ALL PRIVILEGES ON DATABASE taskmanager_tasks TO taskmanager;