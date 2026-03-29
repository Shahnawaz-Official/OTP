# 🔐 OTP Authentication System (Node.js + JWT)

This is a backend authentication system built using Node.js, Express, MongoDB, and JWT. It includes user registration, authentication using Access Token and Refresh Token, and secure cookie handling.

---

## 🚀 Features

* 🧾 User Registration
* 🔐 Password Hashing using Node.js Crypto
* 🎟️ JWT Authentication (Access Token + Refresh Token)
* 🍪 Refresh Token stored in HTTP-only cookies
* 🔄 Token Refresh System
* 👤 Get Logged-in User Details
* ⚡ Clean and modular folder structure

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JSON Web Token (JWT)
* Crypto (for password hashing)
* cookie-parser
* morgan
* dotenv

---

## 📁 Project Structure

```bash
server/
│
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   │
│   ├── controller/
│   │   └── auth.controller.js   # Auth logic
│   │
│   ├── models/
│   │   └── user.model.js    # User schema
│   │
│   ├── routes/
│   │   └── auth.routes.js   # API routes
│   │
│   └── app.js               # Express app setup
│
├── .env
├── server.js                # Entry point
├── package.json
```

---

## ⚙️ Environment Variables

Create `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET_KEY=your_secret_key
```

---

## 🔐 API Endpoints

### 1️⃣ Register User

```http
POST /api/auth/register
```

#### Request Body:

```json
{
  "username": "shahnawaz",
  "email": "test@gmail.com",
  "password": "123456"
}
```

#### Response:

```json
{
  "message": "User Register Successfully",
  "user": {
    "id": "user_id",
    "name": "shahnawaz",
    "email": "test@gmail.com"
  },
  "accessToken": "token"
}
```

---

### 2️⃣ Get Current User

```http
GET /api/auth/get-me
```

#### Headers:

```
Authorization: Bearer <accessToken>
```

#### Response:

```json
{
  "message": "User Fetch Successfully",
  "user": {
    "username": "shahnawaz",
    "email": "test@gmail.com"
  }
}
```

---

### 3️⃣ Refresh Token

```http
GET /api/auth/refresh-token
```

#### Description:

* Uses refresh token from cookies
* Generates new access token
* Rotates refresh token

#### Response:

```json
{
  "message": "Access Token Refresh Successfully",
  "accessToken": "new_access_token"
}
```

---

## 🔄 Token System

| Token Type    | Expiry | Storage              |
| ------------- | ------ | -------------------- |
| Access Token  | 15 min | Authorization Header |
| Refresh Token | 7 days | HTTP-only Cookie     |

---

## 🔐 Authentication Flow

1. User registers → access + refresh token generated
2. Access token used for protected routes
3. When access token expires → refresh token API called
4. New access token issued

---

## 🛡️ Security Notes

* Password is hashed using SHA-256 (crypto module)
* Refresh token stored in HTTP-only cookie
* Tokens have expiration time
* Basic error handling implemented

---

## 🧪 Run Project Locally

```bash
# Go to server folder
cd server

# Install dependencies
npm install

# Start server
npm run dev
```

---


## 👨‍💻 Author

Shahnawaz

---
