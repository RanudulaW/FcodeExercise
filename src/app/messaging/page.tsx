"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Avatar, Typography, TextField, Button, CircularProgress, Paper, Box } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useSocket } from "@/context/SocketContext";
import { useNotification } from "@/context/NotificationContext";

export default function MessagingPage() {
  const { data: session, status } = useSession();
  const { socket } = useSocket();
  const { showNotification } = useNotification();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      fetchConversations();
    }
  }, [session]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const result = await res.json();
        setConversations(result.data);
      }
    } catch (error) {
      console.error("Error fetching conversations");
    }
  };

  const fetchMessages = async (userId: string, pageNum: number = 1) => {
    if (pageNum === 1) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/${userId}?page=${pageNum}`);
      if (res.ok) {
        const result = await res.json();
        if (pageNum === 1) {
          setMessages(result.data.messages);
        } else {
          setMessages(prev => [...result.data.messages, ...prev]);
        }
        setHasMore(result.data.hasMore);
        setPage(pageNum);

        // Mark as read
        await fetch(`/api/messages/${userId}/read`, { method: "PUT" });
        if (socket && session) {
          socket.emit("messages_read", { readerId: (session.user as any).id, senderId: userId });
        }
      }
    } catch (error) {
      console.error("Fetch messages error");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId, 1);
    }
  }, [activeChatId]);

  // Scroll to bottom on new messages (if page 1)
  useEffect(() => {
    if (page === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, page]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket || !session) return;

    const handleReceiveMessage = (message: any) => {
      if (activeChatId === message.sender) {
        setMessages(prev => [...prev, message]);
        // Mark as read immediately if chat is open
        fetch(`/api/messages/${message.sender}/read`, { method: "PUT" });
        socket.emit("messages_read", { readerId: (session.user as any).id, senderId: message.sender });
      } else {
        // Show notification if chat not open
        showNotification("New message received", "info");
      }
    };

    const handleMessagesRead = (data: { readerId: string }) => {
      if (activeChatId === data.readerId) {
        setMessages(prev => prev.map(msg => ({ ...msg, isRead: true })));
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_read_by_user", handleMessagesRead);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_read_by_user", handleMessagesRead);
    };
  }, [socket, activeChatId, session]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatId) return;

    const tempMessage = {
      _id: Date.now().toString(),
      sender: (session?.user as any).id,
      receiver: activeChatId,
      content: newMessage,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeChatId, content: tempMessage.content }),
      });
      
      if (res.ok) {
        const result = await res.json();
        // Replace temp with real
        setMessages(prev => prev.map(msg => msg._id === tempMessage._id ? result.data : msg));
        
        // Emit via socket
        if (socket) {
          socket.emit("send_message", { receiverId: activeChatId, message: result.data });
        }
      }
    } catch (error) {
      showNotification("Failed to send message", "error");
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      if (scrollTop === 0 && hasMore && !loadingMessages) {
        fetchMessages(activeChatId!, page + 1);
      }
    }
  };

  if (status === "loading") return <Box className="flex justify-center mt-12"><CircularProgress /></Box>;
  if (!session) return <Typography className="text-center mt-12">Please log in to use messaging.</Typography>;

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex">
      {/* Sidebar - Conversations list */}
      <Paper className="w-1/3 rounded-l-xl rounded-r-none border-r border-blue-100 flex flex-col shadow-sm">
        <div className="p-4 border-b border-blue-50">
          <Typography variant="h6" className="font-bold text-blue-900">Messaging</Typography>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-blue-700">No connections to message.</div>
          ) : (
            conversations.map(user => (
              <div 
                key={user._id} 
                onClick={() => setActiveChatId(user._id)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-blue-50 border-b border-blue-50/50 ${activeChatId === user._id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}
              >
                <Avatar src={user.profilePicture || ""} />
                <div>
                  <Typography className="font-bold text-blue-900 line-clamp-1">{user.name}</Typography>
                  <Typography variant="caption" className="text-blue-600 line-clamp-1">{user.headline}</Typography>
                </div>
              </div>
            ))
          )}
        </div>
      </Paper>

      {/* Main Chat Window */}
      <Paper className="flex-1 rounded-r-xl rounded-l-none flex flex-col shadow-sm border border-l-0 border-blue-100">
        {!activeChatId ? (
          <div className="flex-1 flex items-center justify-center text-blue-800">
            Select a connection to start messaging.
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-blue-50 bg-white">
              {conversations.filter(c => c._id === activeChatId).map(user => (
                <div key={user._id} className="flex items-center gap-3">
                  <Avatar src={user.profilePicture || ""} />
                  <div>
                    <Typography className="font-bold text-blue-900">{user.name}</Typography>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-2" 
              ref={chatContainerRef}
              onScroll={handleScroll}
            >
              {hasMore && (
                <div className="text-center py-2">
                  <Button size="small" onClick={() => fetchMessages(activeChatId, page + 1)}>Load earlier messages</Button>
                </div>
              )}
              {messages.map(msg => {
                const isMine = msg.sender === (session.user as any).id;
                return (
                  <div key={msg._id} className={`flex flex-col max-w-[70%] ${isMine ? 'self-end' : 'self-start'}`}>
                    <div className={`p-3 rounded-2xl ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-blue-100 text-blue-900 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                    {isMine && (
                      <div className="self-end mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        <DoneAllIcon sx={{ fontSize: 14, color: msg.isRead ? '#2563eb' : '#9ca3af' }} />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-blue-50 bg-white flex gap-2 items-center">
              <TextField 
                fullWidth 
                variant="outlined" 
                size="small" 
                placeholder="Write a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                variant="contained" 
                color="primary" 
                className="min-w-0 p-2"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <SendIcon />
              </Button>
            </div>
          </>
        )}
      </Paper>
    </div>
  );
}
