"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, Button, Typography, Paper, CircularProgress, Divider, Box } from "@mui/material";
import { useNotification } from "@/context/NotificationContext";
import Link from "next/link";

export default function NetworkPage() {
  const { data: session, status } = useSession();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    pendingRequests: [] as any[],
    connections: [] as any[],
    suggestions: [] as any[]
  });

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      const res = await fetch("/api/connections");
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching network data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (connectionId: string, action: "accept" | "reject") => {
    try {
      const res = await fetch("/api/connections/respond", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, action }),
      });

      if (res.ok) {
        showNotification(`Request ${action}ed`, "success");
        fetchNetworkData(); // Refresh lists
      } else {
        const result = await res.json();
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification("Failed to respond to request", "error");
    }
  };

  const handleConnect = async (receiverId: string) => {
    try {
      const res = await fetch("/api/connections/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });

      if (res.ok) {
        showNotification("Connection request sent", "success");
        fetchNetworkData(); // Refresh lists
      } else {
        const result = await res.json();
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification("Failed to send request", "error");
    }
  };

  if (loading || status === "loading") {
    return <Box className="flex justify-center mt-12"><CircularProgress /></Box>;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      
      {/* Pending Requests */}
      {data.pendingRequests.length > 0 && (
        <Paper className="rounded-xl overflow-hidden shadow-sm border border-blue-100 p-4">
          <Typography variant="h6" className="font-bold text-blue-900 mb-4">
            Invitations ({data.pendingRequests.length})
          </Typography>
          <div className="flex flex-col gap-4">
            {data.pendingRequests.map((req) => (
              <div key={req._id} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Link href={`/profile/${req.sender._id}`} className="flex items-center gap-3">
                  <Avatar src={req.sender.profilePicture || ""} className="w-12 h-12" />
                  <div>
                    <Typography className="font-bold text-blue-900 hover:underline">{req.sender.name}</Typography>
                    <Typography variant="body2" className="text-blue-700">{req.sender.headline || "No headline"}</Typography>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <Button variant="outlined" color="primary" size="small" className="rounded-full font-bold normal-case" onClick={() => handleRespond(req._id, "reject")}>
                    Ignore
                  </Button>
                  <Button variant="contained" color="primary" size="small" className="rounded-full font-bold normal-case" onClick={() => handleRespond(req._id, "accept")}>
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Paper>
      )}

      {/* Suggestions */}
      {data.suggestions.length > 0 && (
        <Paper className="rounded-xl overflow-hidden shadow-sm border border-blue-100 p-4">
          <Typography variant="h6" className="font-bold text-blue-900 mb-4">
            People you may know
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.suggestions.map((user) => (
              <div key={user._id} className="border border-blue-100 rounded-lg p-4 flex flex-col items-center text-center">
                <Avatar src={user.profilePicture || ""} className="w-16 h-16 mb-2" />
                <Link href={`/profile/${user._id}`}>
                  <Typography className="font-bold text-blue-900 hover:underline">{user.name}</Typography>
                </Link>
                <Typography variant="body2" className="text-blue-700 mb-4 line-clamp-2 min-h-[40px]">
                  {user.headline || "No headline"}
                </Typography>
                <Button variant="outlined" color="primary" className="rounded-full font-bold normal-case w-full" onClick={() => handleConnect(user._id)}>
                  Connect
                </Button>
              </div>
            ))}
          </div>
        </Paper>
      )}

      {/* Existing Connections */}
      <Paper className="rounded-xl overflow-hidden shadow-sm border border-blue-100 p-4">
        <Typography variant="h6" className="font-bold text-blue-900 mb-4">
          Your Connections ({data.connections.length})
        </Typography>
        {data.connections.length === 0 ? (
          <Typography className="text-blue-700">You don't have any connections yet.</Typography>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.connections.map((user) => (
              <div key={user._id} className="flex items-center gap-3 p-3 border border-blue-100 rounded-lg">
                <Avatar src={user.profilePicture || ""} className="w-12 h-12" />
                <div>
                  <Link href={`/profile/${user._id}`}>
                    <Typography className="font-bold text-blue-900 hover:underline">{user.name}</Typography>
                  </Link>
                  <Typography variant="body2" className="text-blue-700">{user.headline || "No headline"}</Typography>
                </div>
              </div>
            ))}
          </div>
        )}
      </Paper>
      
    </div>
  );
}
