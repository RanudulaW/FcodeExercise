# LinkedIn Clone

A full-stack, feature-rich LinkedIn clone built using Next.js, React, Node.js, MongoDB, and WebSockets. This application features a comprehensive social graph, a personalized timeline feed, real-time private messaging, push notifications, and a robust profile endorsement system.

## 🌟 Implemented Features

### 1. Authentication & User Profiles
- **Custom Credentials Auth**: Secure registration and login using `next-auth` and `bcrypt`.
- **Profile Management**: Users can edit their profile picture, headline, location, and "about" section.
- **Skills & Endorsements**: Users can add professional skills to their profile. Active connections can click to endorse those skills in real-time.

### 2. Social Graph (Network)
- **Connections (Two-way)**: Users can send connection requests to others. The receiver can accept or decline. Accepted connections automatically trigger a mutual follow.
- **Following (One-way)**: Users can follow or unfollow other users to subscribe to their posts without needing an accepted connection.
- **Dedicated Network UI**: A central hub to manage pending connection requests and view active connections.

### 3. Personalized Feed & Content
- **Post Creation**: Create posts featuring text and image media.
- **Smart Feed**: The timeline intelligently aggregates and displays posts made by the user and the accounts they are currently following.
- **Infinite Scroll**: Feed implements pagination using an `IntersectionObserver` to seamlessly load older posts as you scroll down.
- **Interactions**: Users can Like posts and engage in threaded, nested Commenting on posts.

### 4. Real-time Engine (WebSockets)
- **Standalone Socket Server**: A parallel Node.js `socket.io` server powers real-time events.
- **Live Notifications**: Instant push notifications for Likes, Comments, and Connection Requests. A global unread counter badge updates in the Navbar.
- **Private Messaging**: A dedicated 1-on-1 instant messaging interface between active connections, featuring live delivery and double-check Read Receipts.

### 5. Infrastructure & File Handling
- **Global Search**: Users can search for other professionals by Name or Headline.
- **File Upload Strategy Pattern**: Extensible backend architecture handles image uploads, routing files to specific directories (e.g., `uploads/profiles/`, `uploads/posts/`) with explicit 5MB limits and MIME-type validation. Downloads are protected and restricted to logged-in users.
- **Dockerized Database**: Simple and portable local MongoDB instance via Docker Compose.

---

## 🏗️ Key Architectural Decisions

1. **Database Schema**: 
   - Separated `Post` and `Comment` into different collections to support infinitely deep threaded replies and better query performance.
   - Separated the concept of `Connection` (mutual approval) and `Follow` (one-way subscription) to accurately model modern social network flows (e.g., following an influencer vs connecting with a coworker).
2. **Real-time WebSockets vs Polling**:
   - Chose `socket.io` over standard HTTP polling for instantaneous messaging and notifications, severely reducing database load and improving UX.
   - Decoupled the Socket server (`socket.js`) from the Next.js API routes, running them concurrently to bypass Vercel/Next.js serverless limitations on persistent connections.
3. **Design Pattern for Uploads**:
   - Implemented a standard **Strategy Pattern** (`src/lib/upload/`) for file processing. This allows the backend to dynamically apply different validation rules (size limits, file types) depending on whether the incoming file is a "profile picture" or a "timeline post image."
4. **Design System**: 
   - Used Material-UI (MUI) wrapped with a highly customized Global Theme provider. Strictly adhered to the requested "White background, blue primary, light-blue intermediate" color palette for a professional, cohesive aesthetic.

---

## 🤔 Assumptions Made

1. **Local File Storage**: Assuming this is a local development/demonstration environment, media uploads are saved directly to the local filesystem (`/uploads`) rather than an external cloud bucket (like AWS S3).
2. **Access Control**: Assumed that *only authenticated users* are allowed to view feeds, download images, or search the network. Unauthenticated users are strictly routed to the Login page.
3. **Session Handling**: Assumed JWT session strategy is acceptable for `next-auth` to easily scale the backend horizontally if needed, bypassing the need for session persistence in MongoDB.

---

## 🚀 Instructions to Run the Project

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose (for MongoDB)

### 1. Clone the repository
Navigate to the project root directory in your terminal.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Ensure there is a `.env` file at the root of the project. It should contain:
```env
MONGODB_URI="mongodb://admin:password@localhost:27017/linkedin_clone?authSource=admin"
NEXTAUTH_SECRET="your-super-secret-nextauth-token"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Start the Database
The project includes a `docker-compose.yml` file to instantly spin up a local MongoDB instance with the required credentials.
```bash
docker-compose up -d
```
*(Verify it is running on port 27017)*

### 5. Run the Application
Start the development server. This single command uses `concurrently` to launch both the Next.js frontend (Port 3000) and the WebSocket Server (Port 3001) simultaneously.
```bash
npm run dev
```

### 6. View the App
Open your browser and navigate to:
**http://localhost:3000**

You can register a new account to begin!
