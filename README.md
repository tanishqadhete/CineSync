# 🎬 CineSync

CineSync is a real-time watch party platform that allows users to create private rooms, invite friends using a room code, watch movies together in sync, and chat during the movie. The platform also includes an admin dashboard for managing the movie library.

---

## 🚀 Features

### User Features

* User Registration & Login (JWT Authentication)
* Create a Watch Party Room
* Join a Room using a Room Code
* Leave a Room
* Automatic Host Transfer
* Original Host Regains Control on Rejoin
* View Room Details
* View Active Members
* Kick Members (Host Only)
* Delete Room (Host Only)
* One Active Room per User
* Room Capacity Limits
* Persistent Chat History *(Upcoming)*
* Emoji Support in Chat *(Upcoming)*
* Synchronized Video Playback *(Upcoming)*
* Movie Rating System *(Upcoming)*

### Admin Features

* Secure Admin Login
* Add Movies *(Upcoming)*
* Update Movies *(Upcoming)*
* Remove Movies *(Upcoming)*
* View Movie Ratings *(Upcoming)*

---

# 🛠 Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS

## Backend

* Node.js
* Express.js

## Database

* MongoDB Atlas
* Mongoose

## Authentication

* JSON Web Tokens (JWT)

## Real-Time Communication

* Socket.IO *(Upcoming)*

## Version Control

* Git
* GitHub

---

# 📂 Project Structure

```text
CineSync/
│
├── client/
│   ├── public/
│   └── src/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   └── app.js
│
├── .gitignore
└── README.md
```

---

# 🗄 Database Collections

* Users
* Rooms
* RoomMembers
* Movies
* Messages
* MovieRatings

---

# 📌 Current API Status

### Authentication

* Register User
* Login User
* Get Logged-in User
* Admin Authentication

### Room Management

* Create Room
* Join Room
* Leave Room
* Get Room Details
* Get Room Members
* Kick Member
* Delete Room

### Movie Management

* In Progress

### Chat

* Planned

### Socket.IO

* Planned

---

# 🔒 Business Rules

* A user can be in only one room at a time.
* A user can host only one room at a time.
* Rooms are joined using a unique room code.
* Every room has a configurable maximum member limit.
* Only the current host can control playback.
* If the current host leaves, the earliest active member becomes the temporary host.
* When the original host rejoins, they automatically regain host privileges.
* Temporary hosts cannot remove the original host.
* Chat history remains available for users who join later.
* Rooms are automatically removed five minutes after the movie ends or can be deleted manually by the host.

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone https://github.com/tanishqadhete/cinesync.git
cd cinesync
```

## Install Frontend

```bash
cd client
npm install
```

## Install Backend

```bash
cd ../server
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

---

# 🌱 Seed Initial Data

Create the default admin:

```bash
node seed/seedAdmin.js
```

Seed sample movies:

```bash
node seed/seedMovies.js
```

---

# ▶️ Run the Project

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

---

# 🚧 Upcoming Features

* Admin Movie Management
* Real-Time Chat
* Socket.IO Integration
* Movie Playback Synchronization
* Emoji Support
* Movie Ratings
* Room Auto Deletion
* Frontend Dashboard
* Admin Dashboard
