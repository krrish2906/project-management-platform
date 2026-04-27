# API Documentation

## 🔐 Authentication
All endpoints require authentication via HttpOnly cookie with JWT token.

---

## 📁 Projects API

### **GET /api/projects**
Get all projects for authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [...]
  },
  "count": 5
}
```

---

### **POST /api/projects**
Create new project (automatically creates kanban board).

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project description",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "color": "#3b82f6",
  "icon": "📊"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "project": {
      "_id": "...",
      "name": "My Project",
      "owner": {...},
      "kanban": {...}, // Auto-created
      "members": [...],
      "status": "active"
    }
  },
  "message": "Project and Kanban board created successfully"
}
```

**Features:**
- ✅ Automatically creates kanban board with default columns (Backlog, To Do, In Progress, Completed)
- ✅ Owner automatically added as member with 'owner' role
- ✅ Project and kanban are linked

---

### **GET /api/projects/[id]**
Get single project by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "project": {...}
  }
}
```

---

### **PUT /api/projects/[id]**
Update project (requires owner or admin role).

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "New description",
  "status": "completed",
  "members": [
    {
      "user": "userId",
      "role": "admin"
    }
  ]
}
```

---

### **DELETE /api/projects/[id]**
Delete project (requires owner role).

**Features:**
- ✅ Automatically deletes associated kanban board
- ✅ Automatically deletes all tasks in the project
- ✅ Only project owner can delete

**Response:**
```json
{
  "success": true,
  "message": "Project, kanban board, and associated tasks deleted successfully"
}
```

---

## ✅ Tasks API

### **GET /api/tasks**
Get all tasks (with optional filters).

**Query Parameters:**
- `project` - Filter by project ID
- `status` - Filter by status (backlog, todo, inprogress, completed)

**Example:**
```
GET /api/tasks?project=123&status=todo
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...]
  },
  "count": 10
}
```

---

### **POST /api/tasks**
Create new task (automatically adds to kanban board).

**Request Body:**
```json
{
  "title": "Implement login feature",
  "description": "Add JWT authentication",
  "project": "projectId",
  "status": "todo",
  "priority": "high",
  "labels": ["backend", "security"],
  "code": "PROJ-123",
  "assignee": "userId",
  "dueDate": "2025-12-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": {...}
  },
  "message": "Task created and added to kanban board"
}
```

**Features:**
- ✅ Automatically adds task to project's kanban board
- ✅ Places task in correct column based on status
- ✅ Sets order automatically
- ✅ Reporter is set to authenticated user

---

### **GET /api/tasks/[id]**
Get single task by ID.

---

### **PUT /api/tasks/[id]**
Update task (automatically updates kanban position if status changes).

**Request Body:**
```json
{
  "title": "Updated title",
  "status": "inprogress", // Changes column in kanban
  "priority": "urgent",
  "assignee": "newUserId"
}
```

**Features:**
- ✅ If status changes, task moves to new column in kanban
- ✅ Order is automatically calculated
- ✅ Task status and kanban stay in sync

---

### **DELETE /api/tasks/[id]**
Delete task (automatically removes from kanban board).

**Features:**
- ✅ Removes task from kanban board
- ✅ Deletes task from database

---

## 📊 Kanban API

### **GET /api/kanban/[projectId]**
Get kanban board for a project.

**Response:**
```json
{
  "success": true,
  "data": {
    "kanban": {
      "_id": "...",
      "name": "Project Board",
      "project": {...},
      "columns": [
        {
          "id": "backlog",
          "title": "Backlog",
          "order": 0
        },
        {
          "id": "todo",
          "title": "To Do",
          "order": 1
        },
        {
          "id": "inprogress",
          "title": "In Progress",
          "order": 2
        },
        {
          "id": "completed",
          "title": "Completed",
          "order": 3
        }
      ],
      "tasks": [
        {
          "taskId": {...}, // Populated task object
          "columnId": "todo",
          "order": 0
        }
      ]
    }
  }
}
```

---

### **PUT /api/kanban/[projectId]**
Update kanban board (columns, task positions).

**Request Body:**
```json
{
  "name": "Updated Board Name",
  "columns": [
    {
      "id": "backlog",
      "title": "Backlog",
      "order": 0
    }
  ],
  "tasks": [
    {
      "taskId": "taskId1",
      "columnId": "todo",
      "order": 0
    },
    {
      "taskId": "taskId2",
      "columnId": "inprogress",
      "order": 0
    }
  ]
}
```

**Features:**
- ✅ Update column names, order, limits
- ✅ Reorder tasks within columns
- ✅ Move tasks between columns
- ✅ Automatically updates task status when moved to new column
- ✅ Task status stays in sync with kanban column

**Status Mapping:**
- `backlog` column → `backlog` status
- `todo` column → `todo` status
- `inprogress` column → `inprogress` status
- `completed` column → `completed` status

---

## 🔄 Relationships & Auto-Management

### **Project ↔ Kanban (1:1)**
```
Create Project
    ↓
Auto-creates Kanban
    ↓
Project.kanban = Kanban._id
Kanban.project = Project._id

Delete Project
    ↓
Auto-deletes Kanban
    ↓
Auto-deletes all Tasks
```

### **Task ↔ Kanban (Auto-sync)**
```
Create Task
    ↓
Auto-adds to Kanban
    ↓
Placed in correct column (based on status)

Update Task Status
    ↓
Moves to new column in Kanban

Delete Task
    ↓
Auto-removes from Kanban
```

### **Task Status ↔ Kanban Column (Always in sync)**
```
Task.status === Kanban column ID

backlog ←→ backlog column
todo ←→ todo column
inprogress ←→ inprogress column
completed ←→ completed column
```

---

## 📋 Data Models

### **Project**
```typescript
{
  _id: ObjectId,
  name: string,
  description?: string,
  owner: ObjectId (User),
  kanban: ObjectId (Kanban), // Auto-linked
  members: [{
    user: ObjectId (User),
    role: 'owner' | 'admin' | 'member'
  }],
  status: 'active' | 'archived' | 'completed',
  startDate?: Date,
  endDate?: Date,
  color: string,
  icon?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### **Task**
```typescript
{
  _id: ObjectId,
  title: string,
  description?: string,
  project: ObjectId (Project),
  status: 'backlog' | 'todo' | 'inprogress' | 'completed',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  labels: string[],
  code?: string,
  assignee?: ObjectId (User),
  reporter: ObjectId (User),
  dueDate?: Date,
  comments: number,
  attachments: string[],
  createdAt: Date,
  updatedAt: Date
}
```

### **Kanban**
```typescript
{
  _id: ObjectId,
  name: string,
  project: ObjectId (Project), // unique: one kanban per project
  columns: [{
    id: string,
    title: string,
    order: number,
    taskLimit?: number
  }],
  tasks: [{
    taskId: ObjectId (Task),
    columnId: string, // matches column.id
    order: number
  }],
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Common Workflows

### **1. Create Project with First Task**
```javascript
// 1. Create project (auto-creates kanban)
POST /api/projects
{
  "name": "My Project",
  "description": "Description"
}

// 2. Create task (auto-adds to kanban)
POST /api/tasks
{
  "title": "First Task",
  "project": "projectId",
  "status": "todo"
}

// 3. Get kanban board
GET /api/kanban/projectId
// Task is already in the "todo" column
```

### **2. Move Task Through Workflow**
```javascript
// Move task to "In Progress"
PUT /api/tasks/taskId
{
  "status": "inprogress"
}
// Automatically moves in kanban board

// Move task to "Completed"
PUT /api/tasks/taskId
{
  "status": "completed"
}
// Automatically moves to completed column
```

### **3. Reorder Tasks via Drag-and-Drop**
```javascript
// Update entire kanban task order
PUT /api/kanban/projectId
{
  "tasks": [
    { "taskId": "task1", "columnId": "todo", "order": 0 },
    { "taskId": "task2", "columnId": "todo", "order": 1 },
    { "taskId": "task3", "columnId": "inprogress", "order": 0 }
  ]
}
// Task statuses automatically update based on column
```

---

## 🚀 Testing

Use these cURL commands or Postman:

### **Create Project**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "Testing"}'
```

### **Get Projects**
```bash
curl http://localhost:3000/api/projects
```

### **Create Task**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "project": "PROJECT_ID",
    "status": "todo"
  }'
```

### **Get Kanban**
```bash
curl http://localhost:3000/api/kanban/PROJECT_ID
```

---

## ✨ Key Features

✅ **Auto-Kanban Creation** - Every project gets a kanban board automatically  
✅ **Auto-Sync** - Tasks and kanban always stay in sync  
✅ **Cascade Delete** - Deleting project removes kanban and all tasks  
✅ **Status Mapping** - Task status automatically maps to kanban column  
✅ **One-to-One** - Each project has exactly one kanban board  
✅ **Protected** - Only kanban can exist with a project (no orphan kanbans)  

Your CRUD system is production-ready! 🎉
