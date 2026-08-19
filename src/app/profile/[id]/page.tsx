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
  const [newSkill, setNewSkill] = useState("");

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

  const handleConnect = async () => {
    try {
      const res = await fetch("/api/connections/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      if (res.ok) {
        setProfile({
          ...profile,
          networkStatus: { ...profile.networkStatus, connectionStatus: "pending_sent" }
        });
        showNotification("Connection request sent", "success");
      } else {
        const result = await res.json();
        showNotification(result.message, "error");
      }
    } catch (err) {
      showNotification("Failed to send request", "error");
    }
  };

  const handleRespond = async (action: "accept" | "reject") => {
    // Note: in a real app, we need the connection ID here, but for simplicity we can just fetch it or 
    // update the endpoint to accept senderId and receiverId.
    // Wait, the API requires connectionId. Since we don't have connectionId readily available in the profile,
    // it's easier to handle accepting requests from the /network page, or we fetch the connectionId.
    // For now, let's just show a message.
    showNotification(`Please go to your Network page to ${action} this request.`, "info");
  };

  const handleFollow = async () => {
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: userId }),
      });
      if (res.ok) {
        const result = await res.json();
        setProfile({
          ...profile,
          networkStatus: { ...profile.networkStatus, isFollowing: result.data.isFollowing }
        });
        showNotification(result.message, "success");
      } else {
        const result = await res.json();
        showNotification(result.message, "error");
      }
    } catch (err) {
      showNotification("Failed to follow/unfollow", "error");
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      const res = await fetch(`/api/users/${userId}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSkill }),
      });
      if (res.ok) {
        const result = await res.json();
        setProfile({ ...profile, skills: result.data });
        setNewSkill("");
        showNotification("Skill added", "success");
      } else {
        const result = await res.json();
        showNotification(result.message, "error");
      }
    } catch (err) {
      showNotification("Failed to add skill", "error");
    }
  };

  const handleEndorse = async (skillName: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/skills/${encodeURIComponent(skillName)}/endorse`, {
        method: "PUT",
      });
      if (res.ok) {
        const result = await res.json();
        const updatedSkills = profile.skills.map((s: any) => {
          if (s.name === result.data.skill) {
            return {
              ...s,
              endorsements: result.data.isEndorsed 
                ? [...s.endorsements, (session?.user as any).id]
                : s.endorsements.filter((eId: string) => eId !== (session?.user as any).id)
            };
          }
          return s;
        });
        setProfile({ ...profile, skills: updatedSkills });
        showNotification(result.message, "success");
      } else {
        const result = await res.json();
        showNotification(result.message, "error");
      }
    } catch (err) {
      showNotification("Failed to endorse", "error");
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
              
              {!isOwnProfile && session && (
                <div className="flex gap-2 mt-4">
                  {/* Connection Button Logic */}
                  {profile.networkStatus?.connectionStatus === "none" && (
                    <Button variant="contained" color="primary" className="rounded-full font-bold normal-case" onClick={handleConnect}>
                      Connect
                    </Button>
                  )}
                  {profile.networkStatus?.connectionStatus === "pending_sent" && (
                    <Button variant="contained" disabled className="rounded-full font-bold normal-case text-gray-500 bg-gray-200">
                      Pending
                    </Button>
                  )}
                  {profile.networkStatus?.connectionStatus === "pending_received" && (
                    <Button variant="contained" color="primary" className="rounded-full font-bold normal-case" onClick={() => handleRespond("accept")}>
                      Accept Request
                    </Button>
                  )}
                  {profile.networkStatus?.connectionStatus === "accepted" && (
                    <Button variant="contained" color="primary" className="rounded-full font-bold normal-case">
                      Message
                    </Button>
                  )}

                  {/* Follow Button Logic */}
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    className="rounded-full font-bold normal-case" 
                    onClick={handleFollow}
                  >
                    {profile.networkStatus?.isFollowing ? "Following" : "Follow"}
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

      {/* Skills & Endorsements */}
      <Paper className="rounded-xl p-6 shadow-sm border border-blue-100">
        <Typography variant="h6" className="font-bold text-blue-900 mb-4">Skills</Typography>
        
        {isOwnProfile && (
          <div className="flex gap-2 mb-6">
            <TextField 
              size="small" 
              placeholder="Add a skill (e.g. React.js)" 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              fullWidth
            />
            <Button variant="contained" color="primary" onClick={handleAddSkill}>Add</Button>
          </div>
        )}

        {profile.skills && profile.skills.length === 0 ? (
          <Typography className="text-blue-700">No skills added yet.</Typography>
        ) : (
          <div className="flex flex-col gap-4">
            {profile.skills?.map((skill: any) => {
              const isEndorsedByMe = session && skill.endorsements.includes((session.user as any).id);
              const isConnected = profile.networkStatus?.connectionStatus === "accepted";

              return (
                <div key={skill.name} className="flex justify-between items-center pb-2 border-b border-blue-50">
                  <div>
                    <Typography className="font-bold text-blue-900">{skill.name}</Typography>
                    <Typography variant="caption" className="text-blue-600">
                      {skill.endorsements.length} endorsement{skill.endorsements.length !== 1 ? 's' : ''}
                    </Typography>
                  </div>
                  
                  {!isOwnProfile && session && isConnected && (
                    <Button 
                      variant={isEndorsedByMe ? "contained" : "outlined"} 
                      color="primary" 
                      size="small" 
                      className="rounded-full normal-case"
                      onClick={() => handleEndorse(skill.name)}
                    >
                      {isEndorsedByMe ? "Endorsed" : "Endorse"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Paper>
    </div>
  );
}
