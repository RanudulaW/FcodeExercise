"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, Typography, Button, CircularProgress, Paper, Box } from "@mui/material";
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

export default function SearchPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const { showNotification } = useNotification();
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query && session) {
      fetchResults();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [query, session, status]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query || "")}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.data);
      }
    } catch (error) {
      showNotification("Failed to fetch search results", "error");
    } finally {
      setLoading(false);
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
      } else {
        const data = await res.json();
        showNotification(data.message, "error");
      }
    } catch (error) {
      showNotification("Failed to connect", "error");
    }
  };

  if (status === "loading" || loading) {
    return <Box className="flex justify-center mt-12"><CircularProgress /></Box>;
  }

  if (!session) {
    return <Typography className="text-center mt-12">Please log in to search.</Typography>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Paper className="rounded-xl overflow-hidden shadow-sm border border-blue-100 p-6">
        <Typography variant="h5" className="font-bold text-blue-900 mb-6">
          Search results for "{query}"
        </Typography>

        {results.length === 0 ? (
          <Typography className="text-blue-700 text-center py-8">No results found.</Typography>
        ) : (
          <div className="flex flex-col gap-4">
            {results.map(user => (
              <div key={user._id} className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                <Link href={`/profile/${user._id}`} className="flex items-center gap-4 flex-1">
                  <Avatar src={user.profilePicture || ""} className="w-14 h-14" />
                  <div>
                    <Typography className="font-bold text-lg text-blue-900 hover:underline">{user.name}</Typography>
                    <Typography variant="body2" className="text-blue-700">{user.headline || "No headline"}</Typography>
                  </div>
                </Link>
                {user._id !== (session.user as any).id && (
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    className="rounded-full font-bold normal-case px-6"
                    onClick={() => handleConnect(user._id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Paper>
    </div>
  );
}
