# ✍️ Creators Platform

Creators Platform is a full-stack MERN application that enables content creators to manage their posts efficiently. It features secure authentication, role-based access, CRUD operations, pagination, and a responsive user interface designed for a seamless content management experience.

## 🌐 Live Demo

**🔗 Live Application:** https://creators-platform-dun.vercel.app/

---

## ✨ Features

* 🔐 **JWT Authentication** – Secure user registration and login.
* 💾 **Persistent Sessions** – Authentication state is maintained across page refreshes.
* 🛡️ **Protected Routes** – Restrict access to authenticated users only.
* 📝 **Complete CRUD Operations** – Create, read, update, and delete posts.
* 📄 **Pagination** – Efficient browsing of large datasets using limit and skip.
* ⚠️ **Centralized Error Handling** – User-friendly error management with toast notifications.
* 📱 **Responsive Design** – Clean and modern interface that works across devices.

---

## 🛠️ Tech Stack

### Frontend

* React
* React Router
* Context API
* Axios
* React Toastify

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)

### Styling

* Vanilla CSS

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd creators-platform
```

---

### 2. Backend Setup

Navigate to the backend directory.

```bash
cd server
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

Start the backend server.

```bash
npm run dev
```

---

### 3. Frontend Setup

Navigate to the frontend directory.

```bash
cd ../client
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server.

```bash
npm run dev
```

---

## 📂 Project Structure

```text
creators-platform/
│
├── client/            # React frontend
├── server/            # Express backend
├── .gitignore
└── README.md
```

---

## 💡 Core Functionality

* User registration and login
* JWT-based authentication
* Protected routes
* Create, edit, and delete posts
* Paginated post listing
* Persistent user sessions
* Toast-based notifications
* Responsive user interface

---

## 📄 License

This project was developed for learning and portfolio purposes. Feel free to explore the source code and use it as a reference for your own projects.

---

## 👨‍💻 Author

**Rishikesh Bagal**

* GitHub: https://github.com/Rishikesh-Bagal
* Live Demo: https://creators-platform-dun.vercel.app/
