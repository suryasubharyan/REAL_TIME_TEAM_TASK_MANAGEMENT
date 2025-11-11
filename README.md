# ⚡ Real-Time Team Task Management System  
### 🧩 MERN Stack + Socket.IO + JWT + Swagger  

[![Node.js](https://img.shields.io/badge/Node.js-22.x-brightgreen?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-black?logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-Frontend-blue?logo=react)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-grey?logo=socket.io)](https://socket.io/)
[![Swagger](https://img.shields.io/badge/Swagger-API%20Docs-brightgreen?logo=swagger)](https://backend-g282.onrender.com/api/docs)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🚀 Overview

A **real-time, collaborative team task management system** built using the **MERN stack** with **Socket.IO** for instant updates and **JWT** authentication for role-based access.

> Designed to help teams collaborate, assign tasks, and track activity — all in real time.

---

## 🧠 Key Features

✅ **JWT Authentication** – Secure login & register with `admin` / `member` roles  
✅ **Role-Based Access** – Fine-grained control over APIs and dashboard actions  
✅ **Real-Time Updates** – Live socket-driven task, project, and activity updates  
✅ **Team Management** – Admins create, members join via team code  
✅ **Project Management** – Admin creates and tracks multiple projects  
✅ **Task Lifecycle** – Create, assign, update, delete with live sync  
✅ **Activity Log** – Auto-tracked changes with real-time broadcast  
✅ **Interactive Swagger Docs** – Self-explaining REST API  
✅ **Deployed on Render** – Accessible anytime at:
> 🌐 [https://backend-g282.onrender.com](https://backend-g282.onrender.com)

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React.js (Vite) |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Mongoose) |
| **Real-time** | Socket.IO |
| **API Docs** | Swagger + YAML |
| **Auth** | JWT (JSON Web Token) |
| **Deployment** | Render |

---

## 🔒 Role-Based Access Summary

| Module | Admin | Member |
|:--------|:--------:|:---------:|
| **Auth** | ✅ Register/Login | ✅ Register/Login |
| **Team** | ✅ Create | ✅ Join/View |
| **Project** | ✅ Create/View | ✅ View |
| **Task** | ✅ CRUD | ⚙️ Update Own/View |
| **Activity** | ✅ View All | ✅ View Team/Project |

---



---

## 🌐 API Documentation

**Swagger UI:**  
- Local: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)  
- Render: [https://backend-g282.onrender.com/api/docs](https://backend-g282.onrender.com/api/docs)







### 🔹 Backend
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/Real-time-task-manage
JWT_SECRET=supersecretkey123
CLIENT_URL=http://localhost:5173

### 🔹 frontend

  -VITE_API_BASE_URL=https://backend-g282.onrender.com/api
  -VITE_SOCKET_URL=https://backend-g282.onrender.com

🧩 API Modules
Module	Path	Description
Auth	/api/auth	Register & Login
Team	/api/team	Create / Join / View Teams
Project	/api/project	Manage Projects under Teams
Task	/api/task	Manage Tasks under Projects
Activity	/api/activity	Track All Team & Project Activities

🛰️ Real-Time Socket Events
Event	Trigger	Description
team:created	Admin creates a team	Broadcasts to all clients
project:created	Admin creates project	Notifies all team members
task_created	Task created	Broadcast task creation
task_updated	Task updated	Real-time task board update
task_deleted	Task deleted	Live deletion update
activity_created	Any user action	Logs and broadcasts activity

🧪 Example Workflow

1️⃣ Admin registers or logs in → Receives JWT
2️⃣ Admin creates team → Unique team code generated
3️⃣ Member joins using team code
4️⃣ Admin creates project under team
5️⃣ Admin assigns tasks to members
6️⃣ Member updates task status → All see changes in real time
7️⃣ Activity log auto-updates

💻 Local Setup Guide
1️⃣ Clone Repository
git clone https://github.com/suryasubharyan/REAL_TIME_TEAM_TASK_MANAGEMENT.git
cd REAL_TIME_TEAM_TASK_MANAGEMENT

2️⃣ Backend Setup
npm install
npm run dev


Runs at: http://localhost:5000

3️⃣ Frontend Setup
cd realtime-task-frontend
npm install
npm run dev


Runs at: http://localhost:5173

🌍 Deployment (Render)
Backend Service

Build Command: npm run build

Start Command: npm start

Add .env values in Render Dashboard

Frontend Service

Deploy as Static Site

Add:

VITE_API_BASE_URL=https://backend-xxxxx.onrender.com/api
VITE_SOCKET_URL=https://backend-xxxxx.onrender.com

🧠 Swagger Role-Based Access Reference
API	Description	Role Access
/api/auth/*	Register / Login	Admin + Member
/api/team	Create team	Admin
/api/team/join	Join team by code	Member
/api/team/my	My teams	Both
/api/project	Create project	Admin
/api/project/team/:teamId	View projects	Both
/api/task	Create task	Admin
/api/task/project/:projectId	View tasks	Both
/api/task/:taskId	Update or delete task	Admin / Owner / Assignee
/api/activity/*	View activities	Both
🏷️ Badges Legend
Badge	Meaning
🟢 Node.js	Backend built with Node.js 22.x
🧩 Socket.IO	Real-time event system
🗂️ Swagger	Interactive API documentation
🔒 JWT Auth	Secure role-based authentication
🚀 Render Deploy	Hosted live backend
⚙️ MongoDB Atlas	Cloud database
