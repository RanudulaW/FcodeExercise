"use client";

import React, { useState, useEffect } from "react";
import { Avatar, Typography, IconButton, Button, TextField, CircularProgress } from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import SendIcon from '@mui/icons-material/Send';
import Link from "next/link";
import { useNotification } from "@/context/NotificationContext";

export default function PostCard({ post, currentUserId }: { post: any, currentUserId: string }) {
  const [likes, setLikes] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUserId));
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  
  const { showNotification } = useNotification();

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: "PUT" });
      if (res.ok) {
        const result = await res.json();
        setLikes(result.data.likes);
        setIsLiked(result.data.isLiked);
      }
    } catch (error) {
      console.error("Like error", error);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/comments`);
      if (res.ok) {
        const result = await res.json();
        setComments(result.data);
      }
    } catch (error) {
      console.error("Fetch comments error", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (!showComments && comments.length === 0) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/posts/${post._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const result = await res.json();
        setComments([...comments, result.data]);
        setNewComment("");
        showNotification("Comment added", "success");
      } else {
        showNotification("Failed to add comment", "error");
      }
    } catch (error) {
      showNotification("Error adding comment", "error");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4 mb-4">
      {/* Author Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/profile/${post.author._id}`}>
          <Avatar src={post.author.profilePicture || ""} className="w-12 h-12 hover:opacity-90 cursor-pointer" />
        </Link>
        <div>
          <Link href={`/profile/${post.author._id}`}>
            <Typography className="font-bold text-blue-900 hover:underline cursor-pointer">{post.author.name}</Typography>
          </Link>
          <Typography variant="body2" className="text-blue-600 line-clamp-1">{post.author.headline}</Typography>
          <Typography variant="caption" className="text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </Typography>
        </div>
      </div>

      {/* Content */}
      <Typography variant="body1" className="text-gray-800 mb-3 whitespace-pre-wrap">
        {post.content}
      </Typography>

      {/* Media */}
      {post.mediaUrl && (
        <div className="mb-3 rounded-lg overflow-hidden border border-gray-100">
          <img src={post.mediaUrl} alt="Post media" className="w-full h-auto max-h-96 object-contain bg-gray-50" />
        </div>
      )}

      {/* Stats */}
      <div className="flex justify-between items-center py-2 border-b border-blue-50 mb-2">
        <Typography variant="caption" className="text-blue-700">{likes} Likes</Typography>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          className={`flex-1 rounded-lg font-bold normal-case ${isLiked ? 'text-blue-700 bg-blue-50' : 'text-blue-800 hover:bg-blue-50'}`}
          startIcon={isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
          onClick={handleLike}
        >
          Like
        </Button>
        <Button 
          className="flex-1 rounded-lg font-bold normal-case text-blue-800 hover:bg-blue-50"
          startIcon={<CommentOutlinedIcon />}
          onClick={toggleComments}
        >
          Comment
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-blue-50">
          {/* Add Comment */}
          <div className="flex gap-2 mb-4">
            <TextField 
              size="small" 
              placeholder="Add a comment..." 
              fullWidth 
              variant="outlined"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button 
              variant="contained" 
              color="primary" 
              className="min-w-0 px-4"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <SendIcon fontSize="small" />
            </Button>
          </div>

          {/* Comment List */}
          {loadingComments ? (
            <div className="flex justify-center p-4"><CircularProgress size={24} /></div>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-2">
                  <Avatar src={comment.author.profilePicture || ""} className="w-8 h-8" />
                  <div className="bg-blue-50 rounded-xl p-3 flex-1">
                    <Typography className="font-bold text-sm text-blue-900">{comment.author.name}</Typography>
                    <Typography variant="body2" className="text-blue-900">{comment.content}</Typography>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
