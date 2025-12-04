# 🎓 Islanders Fullstack Project

A fullstack learning project built with **FastAPI**, **Angular**, authentication with roles/guards, clean folder architecture, and scalable backend/frontend separation.

---

## 🏷️ Badges
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge)

---

## 📝 Short Description

This project is a full-stack learning platform built with Angular (frontend) and FastAPI (backend), designed to simulate a real backoffice environment.
It includes a complete authentication flow, persistent sessions, and role-based permissions (admin, professor, student, guest) that control what each user can view, create, edit, or delete.

Modules like Areas and Modalities are fully implemented with listing, filtering, pagination, detail view, editing, and secure action visibility based on the user’s role.
The architecture follows clean modular organization, Angular signals for state management, and reusable guards to ensure protected and scalable navigation.

> ✍️ **Note:** The project is currently under development. Some sections (features/pages) are still a work in progress.

---

## 🚀 Features Backend
- User authentication (JWT)
- Role-based access control  
- CRUD operations for core resources  
- Request logging  
- Modular architecture (db, repositories, routes)

---

## 🎨 Features Frontend
- Login system  
- Role-based guards  
- Angular interceptors  
- Clean layout separation (front-shell, back-shell, login-shell)

---

## 🔐 Authentication & Authorization
- **JWT Authentication**
- **Roles:** Guest, Student, Teacher and Admin  
- **Guards** protecting pages based on the user's role

---

## 🏗️ System Overview

### **User Roles & Permissions**

| Role       | Permissions |
|------------|-------------|
| Admin      | Full access, manage users & protected routes |
| Manager    | Limited management actions |
| User       | Basic read-only actions depending on module, can't acess to the dashboard (backoffice) |

---

## 📦 Project Structure

### **Backend (FastAPI)**

```text
backend/
│── app/
│   ├── api/              # Routes/endpoints
│   ├── core/             # Config, security, settings
│   ├── db/               # Database session & connection
│   ├── models/           # ORM models
│   ├── repositories/
│   │     └── crud/       # CRUD logic
│   ├── schemas/          # Pydantic schemas
│   └── main.py           # App entrypoint
...
```
<br>

## **Frontend (Angular)**

```text
frontend/
│── src/
│   ├── app/
│   │    ├── core/                 
│   │    │     ├── interceptors/   # Token handling, errors, auth
│   │    │     ├── layouts/
│   │    │     │      ├── back-shell/
│   │    │     │      ├── front-shell/
│   │    │     │      └── login-shell/
│   │    └── ... (modules/components)
│   ├── assets/                     # Static assets
...
```

---

## 🧰 Tech Stack

### **Backend**
- FastAPI  
- Python  
- PostgreSQL  
- SQLAlchemy  
- Pydantic  

### **Frontend**
- Angular  
- TypeScript  
- RxJS  

---

## ⚙️ Installation & Usage

### **1. Clone the Repository**

```bash
git clone https://github.com/goncalo-f-oliveira/islanders-fullstack.git
cd islanders-fullstack
```

---

### **2. Running the Backend**

```bash
cd backend
uvicorn app.main:app --reload
```

Backend will run on:

```
http://localhost:8000
```

---

### **3. Running the Frontend**

```bash
cd frontend
ng serve
```

Frontend will run on:

```
http://localhost:4200
```

---

## 🏆 CRUD Functionality (Current Status)

| Module   | Create | Read | Update | Delete |
|----------|--------|-------|--------|--------|
| Users    | ✔️ | ✔️ | ✔️ | ✔️ |
| Role     | ✔️ | ✔️ | ✔️ | ✔️ |
| Area     | ✔️ | ✔️ | ✔️ | ✔️ |
| Course   | ✔️ | ✔️ | ✔️ | ✔️ |
| Modality | ✔️ | ✔️ | ✔️ | ✔️ |
| Auth     | ✔️ | ✔️ | — | — |

---

## ⭐ Project Highlights

- Clean and scalable folder architecture  
- Full role-based access system  
- Proper separation of frontend/backoffice layouts  
- Consistent naming and structure  
- Modular backend with CRUD repository pattern  

---

## 🗺️ Roadmap

### **Phase 1 — Core System (Done)**
- Authentication system  
- Basic layouts  
- Guards  
- Logging (done)

### **Phase 2 — Application Features (In Progress)**
- User management pages  
- Protected routes  
- CRUD pages for core modules  

### **Phase 3 — Future Add-ons**
- Dashboard widgets  
- Improved UI/UX  
- Notification system  
- Extra modules depending on project evolution  

---

## 🤝 Contributing

- **Gonçalo Oliveira:** https://github.com/goncalo-f-oliveira  
- **Ruben Teixeira:** https://github.com/rubenfteixeira  
