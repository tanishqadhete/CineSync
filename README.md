# 🎬 CineSync

CineSync is a real-time watch-party platform that allows users to create private rooms, invite friends using unique room codes, watch movies together with synchronized playback, and communicate through live chat. The platform also includes an admin dashboard for managing the movie library and viewing movie statistics.

---

## 🌐 Live Demo

- **Live Website:** [CineSync](https://cinesync-frontend-sand.vercel.app/)
- **Backend:** [Render Deployment](https://cinesync-backend-mnq9.onrender.com)

## 🎥 Video Demonstration

Watch the complete demonstration of CineSync, including its user features, watch-party functionality, and admin dashboard.

### ▶️ [Click Here to Watch the CineSync Video Demo](https://drive.google.com/file/d/1LmL28Lf9umBFO_EDMCBmosisI20Ad38g/view?usp=sharing)

---

## 🚀 Features

### User Features

- User Registration & Login (JWT Authentication)
- Create and Join Private Watch-Party Rooms
- Join Rooms Using Unique Room Codes
- Leave Rooms
- Automatic Host Transfer
- View Room Details and Active Members
- Kick Members (Host Only)
- Delete Rooms (Host Only)
- One Active Room per User
- Room Capacity Limits
- Real-Time Chat Using Socket.IO
- Synchronized Video Playback
- Host-Controlled Playback
- Movie Rating System (1–5 Stars)
- Five-Minute Rating Window After Movie Completion
- Automatic Room Cleanup
- Disconnect Grace Period

### Admin Features

- Secure Admin Login
- Add Movies
- Remove Movies
- View Movie Statistics
- Monitor Total Streams
- View Movie Ratings and Average Ratings

---

# 🛠 Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Authentication
- JSON Web Tokens (JWT)

### Real-Time Communication
- Socket.IO

### Deployment
- Vercel (Frontend)
- Render (Backend)

### Version Control
- Git
- GitHub

---

# 📂 Project Structure

```text
CineSync/
│
├── client/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── pages/
│       └── styles/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── socket/
│   ├── utils/
│   └── app.js
│
├── .gitignore
└── README.md
```

---

# 🗄 Database Collections

- Users
- Rooms
- RoomMembers
- Movies
- Messages
- Ratings

---

# 📌 API Functionality

### Authentication
- Register User
- Login User
- Get Logged-in User
- Admin Authentication

### Room Management
- Create Room
- Join Room
- Leave Room
- Get Room Details
- Get Room Members
- Kick Member
- Delete Room
- Automatic Host Transfer
- Room Cleanup

### Movie Management
- Get Movies
- Add Movies (Admin)
- Remove Movies (Admin)
- View Movie Ratings and Statistics

### Real-Time Features
- Room Membership Updates
- Real-Time Chat
- Synchronized Playback
- Playback State Updates
- Host Transfer Notifications
- Movie Completion Events

---

# 🔒 Business Rules

- A user can participate in only one active room at a time.
- Rooms are joined using unique room codes.
- Every room has a configurable maximum member limit.
- Only the current host can control synchronized playback.
- If the current host leaves, another active member becomes the host.
- Hosts can remove members and delete rooms.
- When a movie ends, the room enters the `ENDED` state.
- Users have five minutes to submit their movie ratings.
- After submitting a rating, the user's room membership is cleared.
- The room is automatically deleted when no active members remain.
- Rooms are also deleted when the five-minute rating window expires.
- Movie ratings and statistics are preserved after room deletion.
- Disconnected users receive a short grace period before being removed from active rooms.

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/tanishqadhete/cinesync.git
cd cinesync
```

## 2. Install Frontend Dependencies

```bash
cd client
npm install
```

## 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000
```

For production deployment, configure `VITE_API_URL` in Vercel:

```env
VITE_API_URL=https://cinesync-backend-mnq9.onrender.com
```

**Important:** Never commit `.env` files or actual credentials to GitHub.

---

# 🌱 Seed Initial Data

Create the default admin:

```bash
cd server
node seed/seedAdmin.js
```

Seed sample movies:

```bash
node seed/seedMovies.js
```

---

# ▶️ Run the Project

### Backend

From the `server` directory:

```bash
npm run dev
```

### Frontend

From the `client` directory:

```bash
npm run dev
```

Open the URL displayed by Vite, usually `http://localhost:5173`.

---

# 🎬 How CineSync Works

1. Users register or log in.
2. A user creates a private watch-party room and selects a movie.
3. Friends join the room using its unique code.
4. The host controls video playback for all participants.
5. Members watch synchronized video and communicate through live chat.
6. After the movie ends, members can submit ratings.
7. The room is automatically cleaned up after all members finish or the rating window expires.
