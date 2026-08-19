"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TextField, Button, Typography, Box, Paper } from "@mui/material";
import { useNotification } from "@/context/NotificationContext";

export default function Register() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showNotification("Registration successful! Please sign in.", "success");
        router.push("/login");
      } else {
        const data = await res.json();
        showNotification(data.message || "Registration failed", "error");
      }
    } catch (err) {
      showNotification("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="flex justify-center items-center min-h-[70vh]">
      <Paper elevation={3} className="p-8 w-full max-w-md rounded-xl">
        <Typography variant="h5" component="h1" className="font-bold text-center mb-6">
          Make the most of your professional life
        </Typography>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Full Name"
            variant="outlined"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText="Must be at least 6 characters"
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large" 
            disabled={loading}
            className="mt-2 rounded-full font-bold bg-blue-600 hover:bg-blue-700 py-3"
          >
            {loading ? "Joining..." : "Agree & Join"}
          </Button>
        </form>
        
        <Typography variant="body2" className="text-center mt-6">
          Already on LinkedIn?{" "}
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

