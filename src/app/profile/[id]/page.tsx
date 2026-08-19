"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Avatar, Button, Typography, Paper, Box, TextField, Divider, CircularProgress, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { useNotification } from "@/context/NotificationContext";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const userId = params.id as string;
  const { showNotification } = useNotification();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    headline: "",
    about: "",
    location: ""
  });

  const isOwnProfile = session?.user && (session.user as any).id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (res.ok) {
          const result = await res.json();
          const data = result.data;
          setProfile(data);
          setEditForm({
            name: data.name || "",
            headline: data.headline || "",
            about: data.about || "",
            location: data.location || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const result = await res.json();
        setProfile(result.data);
        setIsEditing(false);
        showNotification("Profile updated successfully", "success");
      } else {
        const result = await res.json();
        showNotification(result.message || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      showNotification("An unexpected error occurred", "error");
    }
  };



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "profile");

    try {
      showNotification("Uploading...", "info");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        // The upload API returns the relative path inside uploads/ e.g., profiles/123.jpg
        const newPath = `/api/download/${result.data.path}`;
        
        // Save it to the user profile
        const updateRes = await fetch(`/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePicture: newPath }),
        });
        
        if (updateRes.ok) {
          setProfile({ ...profile, profilePicture: newPath });
          showNotification("Profile picture updated", "success");
        } else {
          showNotification("Failed to save profile picture", "error");
        }
      } else {
        showNotification(result.message || "Failed to upload image", "error");
      }
    } catch (err) {
      showNotification("An error occurred during upload", "error");
    }
  };

  if (loading || status === "loading") {
    return <Box className="flex justify-center mt-12"><CircularProgress /></Box>;
  }

  if (!profile) {
    return <Typography className="text-center mt-12">Profile not found</Typography>;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      <Paper className="rounded-xl overflow-hidden shadow-sm border border-blue-100">
        <div className="h-48 bg-blue-600 relative">
          {/* Cover photo */}
          {isOwnProfile && (
            <IconButton className="absolute top-4 right-4 bg-white hover:bg-blue-50 shadow-sm text-blue-600" size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-start">
            <div className="relative group">
              <Avatar 
                src={profile.profilePicture || ""} 
                className="w-32 h-32 border-4 border-white -mt-16 bg-white"
              />
              {isOwnProfile && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity w-32 h-32 -mt-16">
                  <span className="text-xs font-bold">Change Photo</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp" 
                    onChange={handleImageUpload} 
                  />
                </label>
              )}
            </div>
            {isOwnProfile && !isEditing && (
              <IconButton onClick={() => setIsEditing(true)} className="mt-4 text-blue-600 hover:bg-blue-50">
                <EditIcon />
              </IconButton>
            )}
          </div>

          {isEditing ? (
            <div className="mt-4 flex flex-col gap-4">
              <TextField 
                label="Full Name" 
                value={editForm.name} 
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                fullWidth size="small"
              />
              <TextField 
                label="Headline" 
                value={editForm.headline} 
                onChange={e => setEditForm({...editForm, headline: e.target.value})}
                fullWidth size="small"
              />
              <TextField 
                label="Location" 
                value={editForm.location} 
                onChange={e => setEditForm({...editForm, location: e.target.value})}
                fullWidth size="small"
              />
              <div className="flex gap-2 justify-end mt-2">
                <Button variant="outlined" color="primary" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Typography variant="h5" className="font-bold text-blue-900">{profile.name}</Typography>
              <Typography variant="body1" className="text-blue-800">{profile.headline || "Add a headline"}</Typography>
              <Typography variant="body2" className="text-blue-600 mt-1">{profile.location || "Add location"}</Typography>
              
              {!isOwnProfile && (
                <div className="flex gap-2 mt-4">
                  <Button variant="contained" color="primary" className="rounded-full font-bold normal-case">
                    Connect
                  </Button>
                  <Button variant="outlined" color="primary" className="rounded-full font-bold normal-case">
                    Message
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Paper>

      <Paper className="rounded-xl p-6 shadow-sm border border-blue-100">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" className="font-bold text-blue-900">About</Typography>
          {isOwnProfile && !isEditing && (
            <IconButton onClick={() => setIsEditing(true)} size="small" className="text-blue-600 hover:bg-blue-50">
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </div>
        
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <TextField 
              multiline 
              rows={4} 
              value={editForm.about} 
              onChange={e => setEditForm({...editForm, about: e.target.value})}
              fullWidth 
              placeholder="Tell us about yourself"
            />
            <div className="flex justify-end">
              <Button variant="contained" color="primary" size="small" onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <Typography variant="body2" className="whitespace-pre-wrap text-blue-900">
            {profile.about || "Nothing to show yet."}
          </Typography>
        )}
      </Paper>
    </div>
  );
}
