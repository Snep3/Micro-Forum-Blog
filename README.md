# Forum Project

**Project description**  
Our project is a simple forum site that lets users create posts and comment on them.

---

**Installing instructions:**  
Open Compass and connect to port  
Open 2 terminals  

```bash
# Backend terminal:
cd end_semester_project/backend
npm i
node server.js
```

```bash
# Frontend terminal:
cd end_semester_project/frontend/micro-forum
npm i
npm run dev
```

---

**Architecture:**  

In the **backend** we have:

- A `models` folder which has the schema for posts, users, and comments.
- A `routes` file that includes all the HTTP methods and logic for the comments, users, and posts.  
  To identify the users on each of those routes we used **middleware** — the middleware allows the program to continue only if the current user is a registered user and gives the ability to delete/edit (PUT/DELETE) only to its author. 
- We use **JWT (JSON Web Tokens)** to authenticate users by verifying a token sent in the request header, allowing access only if the token is valid and belongs to a registered user.
- The server itself sets up an **Express server**, connects to **MongoDB**, enables **CORS** and **JSON parsing**, and defines routes for users, posts, and comments. It listens on a specified port and logs when the server and database are running.

The **frontend** is structured with two main components, wrapped by `App.jsx`.  
The landing page includes two input fields — one for username and one for password — and allows users to either log in or sign up.  
Once a user is authenticated, their JWT token is stored and passed to the `PostPage` component.

On the `PostPage`, users can:
- Create new posts  
- Edit or delete their own posts  
- Add comments to any post  

The UI is styled using the **Bootstrap** library, ensuring a clean, responsive design across both desktop and mobile devices.

All data is stored in **MongoDB**, and can be viewed or managed via **MongoDB Compass**.

---

**Features:**  
- Register/Login  
- Creating, editing and deleting posts  
- Add comments to posts  
- Logging out

---

**Role distribution:**  
We all did everything but the main focus of each one was:  
- **Backend** - Gavriel Shakarov, Matar Calif  
- **Frontend** - Matar Calif, Gil Almog  
- **Design** - Gil Almog, Gavriel Shakarov
