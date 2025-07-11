# iTask Backend

A robust and scalable RESTful API backend for the iTask todo application, featuring user authentication, collection management, and todo organization with sharing capabilities.

## 📌 Project Overview

iTask Backend is a full-featured Node.js/Express server that powers the iTask todo application. It provides a comprehensive API for:

-   **User Management**: Complete authentication system with JWT-based security
-   **Collections**: Organize todos in collections (folders) with privacy controls
-   **Todo Management**: Create, update, share, and track todo items
-   **Access Control**: Fine-grained permissions system for data security
-   **API Security**: HTTP-only cookies, secure JWT handling, and proper error management

## 🚀 Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB with Mongoose ODM
-   **Authentication**: JWT (JSON Web Tokens)
-   **Security**:
    -   bcrypt (password hashing)
    -   HTTP-only cookies
    -   CORS enabled
-   **Development**: Nodemon for hot reloading

## 🔐 Authentication Strategy

The application implements a secure authentication system using:

1. **JWT Tokens**:

    - Access Token (short-lived)
    - Refresh Token (longer validity)
    - Stored in HTTP-only cookies for security

2. **Security Measures**:

    - Passwords hashed using bcrypt
    - Secure cookie settings
    - Token refresh mechanism
    - Protected routes using authentication middleware

3. **Session Flow**:
    ```
    Login/Register → JWT Created → Stored in HTTP-only Cookie →
    Access Protected Routes → Token Expiry →
    Refresh Token → New Access Token
    ```

## 📁 Project Structure

```
src/
├── controllers/          # Route controllers
│   ├── collection.controller.js
│   ├── todo.controller.js
│   └── user.controller.js
├── models/              # Mongoose models
│   ├── collection.model.js
│   ├── todo.model.js
│   └── user.model.js
├── routes/              # API routes
│   ├── collection.route.js
│   ├── todo.route.js
│   └── user.route.js
├── middlewares/         # Custom middleware
│   ├── auth.middleware.js
│   └── error.middleware.js
├── utils/              # Utility functions
├── app.js             # Express app setup
└── index.js           # Server entry point
```

## 📦 Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   MongoDB instance
-   npm or yarn

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/RDFearless/todo-backend.git
    cd todo-backend
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a .env file:

    ```
    PORT=8000
    MONGODB_URI=your_mongodb_uri
    ACCESS_TOKEN_SECRET=your_access_token_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    ACCESS_TOKEN_EXPIRY=1d
    REFRESH_TOKEN_EXPIRY=10d
    ```

4. Start the development server:
    ```bash
    npm run dev
    ```

## ⚙️ API Documentation

For detailed API documentation, please refer to [docs/API.md](docs/API.md).

---

Built with ❤️ by [Rudra Desai](https://github.com/RDFearless)
