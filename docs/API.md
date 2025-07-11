# iTask API Documentation

This document provides detailed information about all API endpoints available in the iTask backend.

## 🔑 User Endpoints

### Authentication

| Endpoint              | Method | Description          | Body                                      |
| --------------------- | ------ | -------------------- | ----------------------------------------- |
| `/users/register`     | POST   | Register new user    | `{ fullname, email, username, password }` |
| `/users/login`        | POST   | User login           | `{ email/username, password }`            |
| `/users/logout`       | POST   | Logout user          | -                                         |
| `/users/access-token` | POST   | Refresh access token | -                                         |

### User Management

| Endpoint                 | Method | Description      | Body                            |
| ------------------------ | ------ | ---------------- | ------------------------------- |
| `/users/profile`         | GET    | Get current user | -                               |
| `/users/profile`         | PATCH  | Update user info | `{ fullname, username, email }` |
| `/users/change-password` | PATCH  | Change password  | `{ oldPassword, newPassword }`  |

## 📁 Collection Endpoints

| Endpoint                                | Method | Description            | Body/Params                    |
| --------------------------------------- | ------ | ---------------------- | ------------------------------ |
| `/collections/me`                       | POST   | Create collection      | `{ name, description, color }` |
| `/collections/me`                       | GET    | List my collections    | -                              |
| `/collections/:collectionId`            | GET    | Get single collection  | `collectionId`                 |
| `/collections/me/:collectionId`         | PUT    | Update collection      | `{ name, description, color }` |
| `/collections/me/:collectionId`         | DELETE | Delete collection      | `collectionId`                 |
| `/collections/me/:collectionId/privacy` | PATCH  | Toggle privacy         | `collectionId`                 |
| `/collections/user`                     | GET    | Get user's collections | `?username=`                   |

## ✅ Todo Endpoints

| Endpoint                        | Method | Description       | Body/Params                 |
| ------------------------------- | ------ | ----------------- | --------------------------- |
| `/todos/:collectionId`          | POST   | Create todo       | `{ title, content }`        |
| `/todos/getTodos/:collectionId` | GET    | List todos        | `collectionId, ?completed=` |
| `/todos/:todoId`                | GET    | Get single todo   | `todoId`                    |
| `/todos/:todoId`                | PUT    | Update todo       | `{ title, content }`        |
| `/todos/:todoId`                | DELETE | Delete todo       | `todoId`                    |
| `/todos/:todoId/toggle`         | PATCH  | Toggle completion | `todoId`                    |
| `/todos/:todoId/share`          | PATCH  | Share todo        | `{ username }`              |
| `/todos/:todoId/unshare`        | PATCH  | Unshare todo      | `{ username }`              |
