"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import { Button, TextField, CircularProgress, Typography } from "@mui/material";
import PhotoIcon from '@mui/icons-material/Photo';
import { useNotification } from "@/context/NotificationContext";

export default function Home() {
  const { data: session, status } = useSession();
  const { showNotification } = useNotification();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  
  const [postContent, setPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      fetchFeed();
    } else if (status === "unauthenticated") {
      setLoadingFeed(false);
    }
  }, [session, status]);

  const fetchFeed = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const result = await res.json();
        setPosts(result.data);
      }
    } catch (error) {
      console.error("Error fetching feed", error);
    } finally {
      setLoadingFeed(false);
    }
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() && !selectedFile) return;
    
    setIsPosting(true);
    let mediaUrl = "";

    try {
      // 1. Upload image if selected
      if (selectedFile) {
        showNotification("Uploading media...", "info");
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("type", "post");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const result = await uploadRes.json();
          mediaUrl = `/api/download/${result.data.path}`;
        } else {
          showNotification("Failed to upload image", "error");
          setIsPosting(false);
          return;
        }
      }

      // 2. Create the post
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: postContent, mediaUrl }),
      });

      if (res.ok) {
        const result = await res.json();
        setPosts([result.data, ...posts]); // Add new post to top of feed
        setPostContent("");
        setSelectedFile(null);
        showNotification("Post created!", "success");
      } else {
        const result = await res.json();
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification("Failed to create post", "error");
    } finally {
      setIsPosting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (status === "loading") {
    return <div className="flex justify-center mt-12"><CircularProgress /></div>;
  }

  if (!session) {
    return <div className="text-center mt-12">Please log in to see your feed.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="hidden md:block col-span-1">
        <Sidebar />
      </div>
      
      <div className="col-span-1 md:col-span-2">
        {/* Create Post Box */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 mb-4">
          <TextField 
            multiline
            rows={2}
            fullWidth
            placeholder="Start a post"
            variant="outlined"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            disabled={isPosting}
          />
          
          {selectedFile && (
            <div className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded flex justify-between items-center">
              <span>Attached: {selectedFile.name}</span>
              <Button size="small" onClick={() => setSelectedFile(null)}>Remove</Button>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <div className="flex gap-2">
              <input 
                type="file" 
                hidden 
                ref={fileInputRef} 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <Button 
                className="flex items-center gap-2 text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors normal-case font-bold"
                startIcon={<PhotoIcon className="text-blue-600" />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isPosting}
              >
                Media
              </Button>
            </div>
            
            <Button 
              variant="contained" 
              color="primary" 
              className="rounded-full font-bold px-6"
              onClick={handlePostSubmit}
              disabled={isPosting || (!postContent.trim() && !selectedFile)}
            >
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
        
        {/* Feed */}
        <div className="flex flex-col gap-4">
          {loadingFeed ? (
            <div className="flex justify-center p-8"><CircularProgress /></div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-8 text-center">
              <Typography className="text-blue-800">Your feed is quiet. Connect with people or write a post!</Typography>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post._id} post={post} currentUserId={(session.user as any).id} />
            ))
          )}
        </div>
      </div>
      
      <div className="hidden md:block col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 sticky top-20">
          <h2 className="font-bold mb-4 text-blue-900">LinkedIn News</h2>
          <ul className="text-sm text-blue-800 space-y-3">
            <li className="cursor-pointer hover:text-blue-600">
              <span className="font-bold block hover:underline">Top news story 1</span>
              <span className="text-xs text-blue-500">Top news • 10,000 readers</span>
            </li>
            <li className="cursor-pointer hover:text-blue-600">
              <span className="font-bold block hover:underline">Top news story 2</span>
              <span className="text-xs text-blue-500">Trending • 5,000 readers</span>
            </li>
            <li className="cursor-pointer hover:text-blue-600">
              <span className="font-bold block hover:underline">Top news story 3</span>
              <span className="text-xs text-blue-500">Just in • 1,200 readers</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

