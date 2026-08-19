const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // User logs in and connects their userId to this socket
  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // A generic push notification event
  socket.on("send_notification", (data) => {
    // data: { receiverId, type, senderName, ... }
    const receiverSocket = onlineUsers.get(data.receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit("new_notification", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Find and remove user from map
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

console.log("Socket.IO server running on port 3001");
