"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, Typography, CircularProgress, Paper, Box, Button } from "@mui/material";
import Link from "next/link";
import { useSocket } from "@/context/SocketContext";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CommentIcon from '@mui/icons-material/Comment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadCount } = useSocket();

  useEffect(() => {
    if (session) {
      fetchNotifications();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const result = await res.json();
        setNotifications(result.data);
      }
    } catch (error) {
      console.error("Fetch notifications error", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PUT" });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Mark read error", error);
    }
  };

  useEffect(() => {
    // Automatically mark all as read when opening the page
    if (notifications.some(n => !n.isRead)) {
      markAllAsRead();
    }
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <ThumbUpIcon className="text-blue-500" />;
      case 'comment': return <CommentIcon className="text-blue-500" />;
      case 'connection_request': return <PersonAddIcon className="text-blue-500" />;
      case 'connection_accepted': return <CheckCircleIcon className="text-blue-500" />;
      default: return <NotificationsIcon className="text-blue-500" />;
    }
  };

  const getMessage = (type: string, name: string) => {
    switch (type) {
      case 'like': return <><span className="font-bold">{name}</span> liked your post.</>;
      case 'comment': return <><span className="font-bold">{name}</span> commented on your post.</>;
      case 'connection_request': return <><span className="font-bold">{name}</span> wants to connect with you.</>;
      case 'connection_accepted': return <><span className="font-bold">{name}</span> accepted your connection request.</>;
      default: return <><span className="font-bold">{name}</span> interacted with you.</>;
    }
  };

  if (status === "loading" || loading) {
    return <Box className="flex justify-center mt-12"><CircularProgress /></Box>;
  }

  if (!session) {
    return <Typography className="text-center mt-12">Please log in to see notifications.</Typography>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Paper className="rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <div className="p-4 border-b border-blue-50 flex justify-between items-center">
          <Typography variant="h6" className="font-bold text-blue-900">Notifications</Typography>
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-blue-700">You have no notifications yet.</div>
        ) : (
          <div className="flex flex-col">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`p-4 border-b border-blue-50 flex gap-4 items-center transition-colors ${!notification.isRead ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
              >
                <Link href={`/profile/${notification.sender._id}`}>
                  <Avatar src={notification.sender.profilePicture || ""} className="w-12 h-12 hover:opacity-90 cursor-pointer" />
                </Link>
                <div className="flex-1">
                  <Typography variant="body1" className="text-blue-900">
                    {getMessage(notification.type, notification.sender.name)}
                  </Typography>
                  <Typography variant="caption" className="text-blue-500">
                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                  </Typography>
                </div>
                <div className="w-10 flex justify-center">
                  {getIcon(notification.type)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Paper>
    </div>
  );
}
