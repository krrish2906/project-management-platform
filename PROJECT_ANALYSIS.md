# Project Analysis

---

# 1. Executive Summary

- **Project Purpose**: ProjectHub (package name `project_management_platform`) is an enterprise-grade, full-stack project management platform built to streamline team workflows, issue tracking, sprint planning, real-time team communication, collaborative document editing, audio/video conferencing, and AI-driven project insights.
- **Main Features**:
  1. **Authentication & User Management**: Role-based access control (`owner`, `admin`, `project_manager`, `developer`, `viewer`), JWT HttpOnly cookie authentication, password reset, profile management, and global team directory with real-time online/offline presence.
  2. **Project Desk & Sprints**: Projects with custom uppercase key prefixes (e.g., `ENG`, `PROJ`), starring, member role assignments, status management (`active`, `archived`, `completed`), visibility controls (`public`, `private`), and sprint backlog planning.
  3. **Issue & Task Tracking**: Full lifecycle management of epics, stories, tasks, bugs, and improvements with priority levels (`critical` down to `lowest`), story points, due date tracking, watchlists, subtasks, labels, and drag-and-drop Kanban board synchronization.
  4. **Real-time Team Chatroom**: Socket.IO powered messaging room per project supporting text chat, file attachments, @mentions detection with push notifications, pinned messages, typing indicators, and automated transcript export.
  5. **Collaborative Document Editing**: Live document drafting with multi-tab `BroadcastChannel` synchronization, remote cursor position indicators, autosave, and full version snapshot/restore history.
  6. **LiveKit Video & Audio Calling**: Integrated group video and audio conferencing utilizing LiveKit SDK token authentication and real-time room joining.
  7. **AI Assistance**: OpenAI-compatible LLM integration (supporting OpenAI, Groq, Together, and Gemini API endpoints) for automated project summary generation and chat transcript analysis.
  8. **Email Notifications**: Nodemailer transport coupled with `@react-email` templates for welcome emails, password resets, and automated notification alerts.
- **Target Users**: Software engineering teams, product managers, scrum masters, cross-functional project leads, and agile organizations.
- **High-Level Overview**: ProjectHub combines a Next.js 16 App Router frontend with a custom Node.js HTTP server running Socket.IO. MongoDB (via Mongoose) handles data persistence, while Zustand manages client-side reactive state with optimistic updates for high performance.

---

# 2. Tech Stack

### Core Frameworks & Runtime
- **Next.js 16.2.1 (App Router)**: Framework for server-rendered page routing, API routes, and React 19 integration.
- **React 19.2.0 & React DOM 19.2.0**: UI rendering library utilizing modern hooks and concurrent features.
- **Node.js (ESNext / ES2017 target)**: Runtime environment executing both Next.js request handling and Socket.IO server logic.
- **Custom Node.js Server (`server.ts` executed with `tsx`)**: Wraps Next.js request handler and Socket.IO server on a unified port.

### Database & ORM
- **MongoDB**: NoSQL document store used for data persistence.
- **Mongoose 8.19.2**: Object Data Modeling (ODM) library for database connection pooling, schema validation, virtuals, and indexing.

### Real-Time & WebSockets
- **Socket.IO 4.8.3 (`socket.io` & `socket.io-client`)**: Provides WebSocket fallback communication for instant chat, presence tracking, typing indicators, notification push, and Kanban movements.
- **BroadcastChannel API**: Browser API utilized for zero-latency multi-tab document state sync.

### State Management & Data Fetching
- **Zustand 5.0.8**: Lightweight, un-opinionated state management powering 7 domain stores (`useAuthStore`, `useProjectStore`, `useTaskStore`, `useSprintStore`, `useNotificationStore`, `useCommentStore`, `useActivityStore`).
- **Axios 1.13.2**: HTTP client used across Zustand stores and components for API communication with credentials enabled.

### Styling & Design System
- **Tailwind CSS v4 (`@tailwindcss/postcss`, `@tailwindcss/typography`)**: Utility-first CSS framework configured via `@import "tailwindcss";` in `globals.css`.
- **Lucide React 0.548.0**: Comprehensive icon library used consistently across headers, sidebars, cards, and modals.
- **React Hot Toast 2.6.0**: Toast notification banner overlay for real-time alerts and user operation feedback.
- **Google Fonts (Poppins)**: Imported via `next/font/google` in `app/layout.tsx`.

### Rich Text & Drag-and-Drop
- **Tiptap 3.20.5 (`@tiptap/react`, `@tiptap/starter-kit`, code block lowlight, tables, mentions)**: Headless rich text editor engine for task descriptions and document drafting.
- **`@hello-pangea/dnd` 18.0.1**: React drag-and-drop library powering the interactive Kanban board columns and card ordering.
- **Yjs (`yjs`, `y-prosemirror`, `y-protocols`)**: CRDT primitives supporting collaborative rich-text editing structures.

### Audio / Video Calling
- **`livekit-client` 2.18.7 & `livekit-server-sdk` 2.15.2**: WebRTC infrastructure for generating access tokens and managing real-time video/audio room sessions.
- **`@livekit/components-react` 2.9.20**: Pre-built UI components for LiveKit video call rooms.

### AI & Email Integration
- **`openai` 6.38.0**: Official OpenAI SDK configured dynamically with custom `AI_BASE_URL` and `AI_API_KEY` environment variables.
- **`nodemailer` 8.0.5 & `@react-email/render` 2.0.0**: Transporter service and React-based email template compiler.

---

# 3. Project Folder Structure

### Root Directory
- [`server.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/server.ts): Custom HTTP server entry point creating `http.createServer`, instantiating Socket.IO at `/api/socket.io`, managing JWT cookie authentication socket middleware, room management (`project:${projectId}`), real-time @mentions notification generation, and delegating standard HTTP routes to Next.js.
- [`package.json`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/package.json): Defines dependencies, scripts (`dev: tsx --env-file=.env server.ts`, `build: next build`, `start`, `seed`), and metadata.
- [`tsconfig.json`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/tsconfig.json): TypeScript compilation options configured with path alias `@/* -> ./*`.
- [`next.config.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/next.config.ts): Next.js configuration object.
- [`postcss.config.mjs`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/postcss.config.mjs): PostCSS pipeline targeting `@tailwindcss/postcss`.

### `app/` Directory (App Router)
- [`app/layout.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/layout.tsx): Root application layout loading Poppins font variable and mounting `Toaster`.
- [`app/globals.css`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/globals.css): CSS entry importing Tailwind v4, `@plugin "@tailwindcss/typography"`, root theme tokens, and custom keyframe animations (`animate-fadeIn`, `animate-slideDown`, `animate-fadeInUp`).
- [`app/page.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/page.tsx): Root landing route. Renders full landing page with DB summary metrics for authenticated users or renders `<Login />` for unauthenticated visitors.
- [`app/dashboard/page.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/dashboard/page.tsx): Main dashboard displaying top KPI metrics, task breakdown by status/priority, personal tasks, recent activity feed, and a floating create project trigger.
- [`app/projects/page.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/projects/page.tsx): All-projects view featuring filter tabs (`All`, `active`, `archived`, `completed`, `Starred`), search, project cards, and star toggles.
- [`app/projects/[id]/`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/projects/[id]): Dynamic project desk container.
  - `page.tsx`: Project overview page with progress bar, team tab, activity tab, discussion thread, task details slideout panel, and quick toolbar links.
  - `kanban/page.tsx`: Interactive Kanban board supporting drag-and-drop column transitions, real-time socket updates, and task creation.
  - `backlog/page.tsx`: Sprint planning interface for moving tasks between backlog and active/future sprints.
  - `chatroom/page.tsx`: Real-time chat application with file attachment uploads, pinned messages, AI summaries, text search, and transcript export.
  - `document/page.tsx`: Collaborative document editor leveraging `useCollaboration` with live multi-tab sync and version restore.
  - `calendar/page.tsx`: Calendar layout mapping tasks by due dates.
  - `call/page.tsx`: LiveKit group video and audio calling interface.
- [`app/tasks/page.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/tasks/page.tsx): Global issue search and filter table supporting multi-field filtering by status, assignee, issue type, and keywords.
- [`app/teams/page.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/teams/page.tsx): Team directory showing all registered users, roles, and real-time Socket.IO online presence indicators.
- [`app/reports/page.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/reports/page.tsx): Visual analytics page rendering task distribution bar charts for status and priority with automated project insight alerts.
- [`app/settings/page.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/settings/page.tsx): Tabbed user settings for Account profile editing, Security password updates, Notification toggles, Billing, Data Export / Account Deletion, and Help.
- [`app/profile/page.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/profile/page.tsx): User profile card displaying account metadata and logout trigger.
- [`app/help/page.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/help/page.tsx): Searchable FAQ and documentation portal.
- [`app/api/`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/api): Next.js Route Handlers organized by domain (`activity`, `auth`, `comments`, `dashboard`, `kanban`, `livekit`, `notifications`, `projects`, `sprints`, `tasks`, `upload`, `users`).
- [`app/components/`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components): Component library containing shared layout structures (`Sidebar`, `Header`), interactive modals (`CreateProjectModal`, `InviteMemberModal`, `NewProjectModal`, `AISummaryModal`), authentication widgets (`Login`, `ForgotPassword`), and feature controls (`Discussion`, `RichTextEditor`, `TaskDetailSlideout`, `TaskDetailsPanel`, `TeamMembers`, `Spinner`).

### `hooks/` Directory
- [`hooks/useAuth.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/hooks/useAuth.ts): Authentication guard hook. Fetches user status via `useAuthStore.checkAuth()` on mount and optionally redirects to `/` if unauthenticated.
- [`hooks/useSocket.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/hooks/useSocket.ts): Encapsulates Socket.IO connection lifecycle, room joins, message sending, typing timeout management, pinning, mark-read, and event dispatch.
- [`hooks/useCollaboration.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/hooks/useCollaboration.ts): Provides multi-tab sync using `BroadcastChannel`, local storage autosave, remote cursor tracking, version snapshotting, and restoration.

### `lib/` Directory
- [`lib/mongodb.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/mongodb.ts): Mongoose database connection wrapper maintaining a global cached promise across development hot-reloads.
- [`lib/auth.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/auth.ts): JWT sign & verify functions, HttpOnly cookie management (`setAuthCookie`, `getAuthToken`, `removeAuthCookie`), and request user extractor (`getAuthUser`).
- [`lib/ai.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/ai.ts): Factory for generating an OpenAI API client dynamically configured for OpenAI, Groq, Together, or Gemini base URLs.
- [`lib/mail/mailer.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/mail/mailer.ts): Nodemailer transporter and `@react-email` renderer for template-based email delivery.
- [`lib/models/`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/models): Mongoose model definitions ([`User.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/models/User.ts), [`Project.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/models/Project.ts), [`Task.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/models/Task.ts), [`Sprint.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/models/Sprint.ts), [`Kanban.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/models/Kanban.ts), [`Message.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/models/Message.ts), [`Comment.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/models/Comment.ts), [`Activity.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/models/Activity.ts), [`Notification.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/models/Notification.ts)).

### `store/` Directory
- [`store/useAuthStore.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useAuthStore.ts): Global authentication state (user, isAuthenticated, isLoading, logout, checkAuth).
- [`store/useProjectStore.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useProjectStore.ts): Global projects list, CRUD operations, and optimistic starring.
- [`store/useTaskStore.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useTaskStore.ts): Task state, filtering API queries, CRUD operations, optimistic status moves, and notification socket triggers.
- [`store/useSprintStore.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useSprintStore.ts): Sprint planning state, create/update/start/complete methods.
- [`store/useNotificationStore.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useNotificationStore.ts): Application notifications list, unread count, optimistic mark-read and clear-all operations.
- [`store/useCommentStore.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useCommentStore.ts): Task comments state and thread hierarchy management.
- [`store/useActivityStore.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useActivityStore.ts): Audit trail activity feed events fetcher.

### `types/` Directory
- [`types/index.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/types/index.ts): Central TypeScript definitions (`User`, `Project`, `Task`, `Comment`, `Sprint`, `Activity`, `AppNotification`, `Column`, `ApiResponse`, `IssueType`, `IssuePriority`, `IssueStatus`).

---

# 4. Application Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │             Client Browser (React 19)        │
                               └──────┬───────────────────────────────┬───────┘
                                      │ HTTP / REST                   │ WebSockets (Socket.IO)
                                      ▼                               ▼
                               ┌──────────────────────────────────────────────┐
                               │           Custom Node.js Server             │
                               │               (server.ts)                    │
                               │  ┌──────────────────────┐ ┌───────────────┐  │
                               │  │ Next.js App Router   │ │ Socket.IO     │  │
                               │  │ Request Handler      │ │ Server Engine │  │
                               │  └──────────┬───────────┘ └───────┬───────┘  │
                               └─────────────┼─────────────────────┼──────────┘
                                             │ Mongoose ODM        │ Real-time Events
                                             ▼                     ▼
                               ┌──────────────────────────────────────────────┐
                               │                 MongoDB                      │
                               └──────────────────────────────────────────────┘
```

### Layer Separation
1. **Presentation Layer (`app/`, `app/components/`)**: Client Components decorated with `'use client'`, handling UI rendering, local input forms, drag-and-drop events, and modal visibility.
2. **State & Store Layer (`store/`, `hooks/`)**: Zustand stores act as the single source of truth for client state, decoupling UI components from raw Axios API calls.
3. **API & Real-time Server Layer (`server.ts`, `app/api/`)**: Next.js Route Handlers process RESTful JSON requests. `server.ts` handles persistent WebSocket connections and broadcasts events across rooms.
4. **Data Access & Persistence Layer (`lib/mongodb.ts`, `lib/models/`)**: Mongoose models handle data validation, relationships, schema types, and index execution on MongoDB.

---

# 5. Component Architecture

### Layout Components
- [`Sidebar.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components/Sidebar.tsx): Persistent desktop navigation sidebar rendering links for Dashboard, Projects, Tasks, Teams, Reports, Settings, Help, and Profile avatar summary.
- [`Header.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components/Header.tsx): Top navigation bar with dynamic page title, global search input, interactive notification popover dropdown with mark-all/clear actions, and user profile avatar.

### Feature Components
- [`Discussion.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components/Discussion.tsx): Threaded comment discussion widget for project overview pages supporting replies, mentions, editing, and deletion.
- [`TaskDetailsPanel.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components/TaskDetailsPanel.tsx) & [`TaskDetailSlideout.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components/TaskDetailSlideout.tsx): Comprehensive side panels for viewing and editing issue details, assignees, priorities, types, due dates, story points, and subtasks.
- [`TeamMembers.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components/TeamMembers.tsx): Member listing component for project team management.
- [`RichTextEditor.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components/RichTextEditor.tsx): Tiptap-powered editor wrapper with formatting toolbar.

### Modal & Dialog Components
- [`CreateProjectModal.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components/CreateProjectModal.tsx): Modal dialog for creating new projects with automatic uppercase key generation (`ENG`, `PROJ`).
- [`InviteMemberModal.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components/InviteMemberModal.tsx): Dialog for selecting registered users and inviting them to project teams.
- [`AISummaryModal.tsx`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/app/components/AISummaryModal.tsx): Modal presenting AI-generated chat summaries and action items.

---

# 6. Routing

### Navigation Tree
- `/`: Landing page / Login entry point.
- `/dashboard`: Primary workspace dashboard.
- `/projects`: All-projects catalog and creation entry.
- `/projects/[id]`: Project overview desk.
  - `/projects/[id]/kanban`: Dynamic Kanban board view.
  - `/projects/[id]/backlog`: Sprint planning and backlog view.
  - `/projects/[id]/chatroom`: Real-time chatroom.
  - `/projects/[id]/document`: Collaborative document editor.
  - `/projects/[id]/calendar`: Task calendar view.
  - `/projects/[id]/call`: LiveKit audio/video group call room.
- `/tasks`: Global task search and filtering table.
- `/teams`: Team directory with live presence indicators.
- `/reports`: Real-time analytics and distribution charts.
- `/settings`: Account and application preferences.
- `/profile`: Individual profile page.
- `/help`: Help center and FAQ repository.

---

# 7. State Management

### Zustand Store Architecture
1. [`useAuthStore`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useAuthStore.ts): Manages `user`, `isAuthenticated`, and `isLoading`. Executes `checkAuth()` against `/api/auth/me` and handles logout.
2. [`useProjectStore`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useProjectStore.ts): Manages `projects` array. Implements optimistic updates for project starring (`toggleStar`).
3. [`useTaskStore`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useTaskStore.ts): Holds `tasks`. Performs optimistic status moves (`moveTask`) and emits notification triggers over Socket.IO when assignees change.
4. [`useSprintStore`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useSprintStore.ts): Tracks sprints for a given project and handles sprint lifecycle states (`planning`, `active`, `completed`).
5. [`useNotificationStore`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useNotificationStore.ts): Stores `notifications` and `unreadCount` with optimistic read/clear operations.
6. [`useCommentStore`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useCommentStore.ts): Fetches and updates threaded task comments.
7. [`useActivityStore`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/store/useActivityStore.ts): Holds recent audit trail events.

---

# 8. API Layer

### Route Handlers Summary
- **`POST /api/auth/login`**: Validates credentials with `bcryptjs`, issues JWT signed token, sets HttpOnly cookie.
- **`POST /api/auth/signup`**: Creates new user with hashed password, sets HttpOnly cookie.
- **`GET /api/auth/me`**: Verifies cookie JWT and returns authenticated user object.
- **`POST /api/auth/logout`**: Clears `auth-token` cookie.
- **`GET/POST /api/projects`**: Fetches filtered project list or creates new project with default Kanban initialization.
- **`GET/PUT/DELETE /api/projects/[id]`**: Fetches, updates, or deletes single project document.
- **`PUT /api/projects/[id]/star`**: Toggles star state for user.
- **`POST /api/projects/[id]/ai/summarize-chat`**: Aggregates chat history and invokes OpenAI client for summary text.
- **`GET/POST /api/tasks`**: Retrieves task lists by filter query params or creates a new task issue.
- **`PUT/DELETE /api/tasks/[id]`**: Updates issue attributes or removes issue.
- **`GET/POST/PUT /api/sprints`**: Manages project sprints and updates sprint statuses.
- **`GET/POST /api/comments`**: Retrieves and adds task comments.
- **`GET/PUT/DELETE /api/notifications`**: Manages user notifications and unread counters.
- **`POST /api/upload`**: Handles file uploads and returns metadata objects for attachments.
- **`GET /api/livekit/token`**: Generates LiveKit access tokens for WebRTC calls.

---

# 9. Authentication & Authorisation

- **Authentication Protocol**: JWT (JSON Web Tokens) generated using `jsonwebtoken` with 1-day expiration, stored securely in an `auth-token` HttpOnly cookie.
- **Password Protection**: Passwords hashed using `bcryptjs` (salt factor 10) with `{ select: false }` set on Mongoose schema to prevent accidental password hash leakage.
- **Role Hierarchy**:
  - `owner`: Full project management permissions including project deletion and message pinning.
  - `admin`: Administrative privileges over members and task operations.
  - `project_manager`: Full issue management, sprint control, and team assignment.
  - `developer`: Default member role for creating, editing, and resolving assigned tasks.
  - `viewer`: Read-only access to project desks and task boards.
- **Route & Socket Middleware**: Next.js requests validated via `requireAuth(request)` in [`lib/auth.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/auth.ts). Socket.IO handshake authenticated via `verifyTokenFromCookie(socket.handshake.headers.cookie)`.

---

# 10. Hooks

### Custom Hooks Reference
- **`useAuth(requireAuth: boolean = true)`**:
  - *Purpose*: Handles authentication verification on component mount and optional route redirection.
  - *Inputs*: `requireAuth` boolean (defaults to `true`).
  - *Outputs*: `{ user, isAuthenticated, isLoading, logout }`.
- **`useSocket(options: UseSocketOptions)`**:
  - *Purpose*: Manages Socket.IO lifecycle, room subscriptions (`project:${id}`), event handlers, and dispatch helpers.
  - *Inputs*: `{ projectId, onMessage, onUserJoined, onUserLeft, onUserTyping, onError, onActiveUsers, onMessagePinned, onGlobalActiveUsers }`.
  - *Outputs*: `{ socket, isConnected, sendMessage, setTyping, pinMessage, markAsRead, activeUsers, error }`.
- **`useCollaboration(projectId: string | string[], fallbackContent: string = '')`**:
  - *Purpose*: Powers live collaborative document editing across tabs.
  - *Inputs*: `projectId`, `fallbackContent`.
  - *Outputs*: `{ content, updateContent, cursors, updateCursor, versions, saveVersion, restoreVersion }`.

---

# 11. Utilities

- [`lib/mongodb.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/mongodb.ts): Provides `connectDB()` helper managing a cached connection pool across hot reloads.
- [`lib/auth.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/auth.ts): Token payload helpers (`generateToken`, `verifyToken`, `setAuthCookie`, `getAuthUser`, `removeAuthCookie`).
- [`lib/ai.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/ai.ts): `getAIClient()` returning configured `OpenAI` instance based on `.env` settings.
- [`lib/mail/mailer.ts`](file:///c:/Users/Krish/Desktop/FullStack%20Projects/project-management-platform/lib/mail/mailer.ts): `sendEmail(options)` function wrapping Nodemailer and `@react-email/render`.

---

# 12. Styling System

- **Framework**: Tailwind CSS v4 configured in `app/globals.css`.
- **Typography**: Google Poppins font applied globally via `--font-poppins` CSS variable.
- **Color Tokens**: Standardized Tailwind palettes (Blue, Purple, Emerald, Amber, Red) tailored to issue statuses and priorities.
- **Animations**: Custom keyframe rules defined in `globals.css`:
  - `.animate-fadeIn`: `fadeIn 0.3s ease-out forwards`
  - `.animate-slideDown`: `slideDown 0.2s ease-out forwards`
  - `.animate-fadeInUp`: `fadeInUp 0.25s ease-out forwards`

---

# 13. Reusable Patterns

1. **Optimistic UI Updates**: Executed in Zustand stores (`toggleStar`, `moveTask`, `markAsRead`) to update local state immediately before network confirmation.
2. **Custom Socket Event Bridge**: React refs (`callbacksRef`) inside `useSocket.ts` prevent unnecessary socket reconnections while binding latest state callbacks.
3. **Mongoose Cached Connection Pattern**: Prevents exponential connection growth during development hot-reloading by maintaining `global.mongoose`.
4. **Custom Server Socket & HTTP Composition**: `server.ts` unifies Next.js request dispatch with Socket.IO room management.

---

# 14. Third-Party Integrations

- **MongoDB Atlas / Local MongoDB**: Persistent database store.
- **LiveKit Server / Cloud**: WebRTC video/audio streaming provider.
- **OpenAI / Groq / Gemini Endpoints**: LLM APIs powering summary generation.
- **SMTP Email Server (Nodemailer)**: SMTP host for transactional emails.

---

# 15. Important Workflows

### 1. User Authentication Workflow
```
[User Form] ──> POST /api/auth/login ──> bcrypt.compare ──> generateToken ──> setAuthCookie (HttpOnly) ──> Zustand useAuthStore.setUser()
```

### 2. Real-time Project Chat & Mention Workflow
```
[User Message] ──> Socket.emit('send-message') ──> server.ts receives ──> Save to MongoDB ──> Detect @mentions ──> Create Notification Doc ──> io.to(recipientSocket).emit('new-notification') ──> Toast alert rendered on Client
```

### 3. Kanban Drag and Drop Task Move Workflow
```
[Drag Card] ──> OnDragEnd ──> useTaskStore.moveTask() (Optimistic UI update) ──> PUT /api/tasks/[id] ──> Socket.emit('kanban:task_moved') ──> Broadcast to project room
```

---

# 16. Coding Conventions

- **File Naming**: PascalCase for React Components (`Sidebar.tsx`, `Header.tsx`), camelCase for stores and hooks (`useAuthStore.ts`, `useSocket.ts`), and camelCase/PascalCase for utilities and models (`mongodb.ts`, `Project.ts`).
- **TypeScript Usage**: Strict mode enabled (`"strict": true` in `tsconfig.json`). Interfaces centralized in `types/index.ts`.
- **Import Ordering**:
  1. Core React & Next.js imports (`react`, `next/navigation`).
  2. Icons (`lucide-react`) & third-party libraries (`axios`, `zustand`).
  3. Custom hooks & stores (`@/hooks/...`, `@/store/...`).
  4. Components & types (`@/app/components/...`, `@/types`).

---

# 17. Performance Optimisations

1. **Connection Caching**: Singleton Mongoose connection caching in `lib/mongodb.ts`.
2. **Optimistic Store Updates**: Instant UI transitions in Zustand stores before server response.
3. **Database Indexing**: Compound indexes on Mongoose schemas (`{ project: 1, status: 1 }`, `{ key: 1 }`, `{ recipient: 1, read: 1 }`).
4. **Client-Side Debouncing**: Debounced search inputs and autosave timers (e.g., 1.5s autosave debounce in `useCollaboration.ts`).

---

# 18. Architecture Strengths

1. **Unified Real-Time Architecture**: Seamless integration of HTTP REST and WebSockets in `server.ts`.
2. **Robust Type Safety**: Shared interface types in `types/index.ts` ensure consistency across frontend stores and backend endpoints.
3. **Optimistic UX**: High operational responsiveness due to Zustand optimistic updates.
4. **Rich Collaboration Options**: Combines chat, video calling, document editing, and Kanban boards in a single platform.

---

# 19. Areas Requiring Attention

1. **Socket Fallback Logic in Task Store**: `useTaskStore.ts` instantiates a temporary socket via `io()` inside `updateTask` to emit notifications. Integrating this directly with the existing `useSocket` singleton or an API route trigger would streamline socket connections.
2. **Environment Variable Configuration**: Ensure `JWT_SECRET`, `MONGODB_URI`, and LiveKit parameters are properly defined in production environment configurations.

---

# 20. Developer Mental Model

### How to Add a New Page
1. Create a folder under `app/` (e.g., `app/analytics/page.tsx`).
2. Mark as `'use client'` if interactive.
3. Wrap with `<Sidebar />` and `<Header />` layout components.
4. Enforce auth guard with `useAuth(true)`.

### How to Add a New API Route
1. Create a folder under `app/api/` (e.g., `app/api/custom-feature/route.ts`).
2. Export async functions (`GET`, `POST`, `PUT`, `DELETE`).
3. Call `await connectDB()` at the start of the handler.
4. Authenticate using `getAuthUser(request)`.
5. Perform Mongoose queries and return `NextResponse.json({ success: true, data })`.

### How to Add a State Property
1. Update `types/index.ts` if needed.
2. Update the corresponding Zustand store in `store/`.
3. Add store action for fetching/updating data.

---

# 21. Key Takeaways

ProjectHub is a feature-rich, full-stack Next.js project management application powered by MongoDB and Socket.IO. By decoupling UI components from network calls via Zustand stores and utilizing a custom HTTP server for WebSockets, the codebase provides real-time collaboration, rich task management, video calling, document editing, and AI assistance. Future enhancements should follow the established store-driven pattern, Mongoose schema indexing, and role-based API protection.
