"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TextField, Button, Typography, Box, Paper, Alert } from "@mui/material";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <Box className="flex justify-center items-center min-h-[70vh]">
      <Paper elevation={3} className="p-8 w-full max-w-md rounded-xl">
        <Typography variant="h5" component="h1" className="font-bold mb-2">
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mb-6">
          Stay updated on your professional world
        </Typography>
        
        {registered && <Alert severity="success" className="mb-4">Registration successful! Please sign in.</Alert>}
        {error && <Alert severity="error" className="mb-4">{error}</Alert>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            size="large" 
            disabled={loading}
            className="mt-2 rounded-full font-bold bg-blue-600 hover:bg-blue-700 py-3"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        
        <Typography variant="body2" className="text-center mt-6">
          New to LinkedIn?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Join now
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
