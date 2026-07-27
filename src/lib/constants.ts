export const APP_ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    PROJECTS: '/projects',
    TASKS: '/tasks',
    TEAMS: '/teams',
    REPORTS: '/reports',
    SETTINGS: '/settings',
    PROFILE: '/profile',
    HELP: '/help',
};

export const TASK_STATUS_MAP = {
    TODO: { label: 'To Do', color: 'gray' },
    IN_PROGRESS: { label: 'In Progress', color: 'blue' },
    IN_REVIEW: { label: 'In Review', color: 'yellow' },
    DONE: { label: 'Done', color: 'green' },
};

export const TASK_PRIORITY_MAP = {
    LOW: { label: 'Low', color: 'gray' },
    MEDIUM: { label: 'Medium', color: 'blue' },
    HIGH: { label: 'High', color: 'yellow' },
    URGENT: { label: 'Urgent', color: 'red' },
};
