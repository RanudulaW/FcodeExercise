"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Link from 'next/link';

const Sidebar = () => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [connectionsCount, setConnectionsCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      const userId = (session.user as any).id;
      
      // Fetch user profile
      fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProfile(data.data);
          }
        });

      // Fetch connections to get count
      fetch("/api/connections")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.connections) {
            setConnectionsCount(data.data.connections.length);
          }
        });
    }
  }, [session]);

  if (!session) return null;

  return (
    <Card className="rounded-lg overflow-hidden border border-blue-100 shadow-sm mb-4">
      <Box className="relative h-16 bg-blue-600">
        {/* Cover Photo Placeholder */}
      </Box>
      <Box className="flex flex-col items-center px-4 pb-4 relative">
        <Link href={`/profile/${(session.user as any).id}`}>
          <Avatar 
            src={profile?.profilePicture || ""} 
            className="w-16 h-16 border-2 border-white -mt-8 mb-2 cursor-pointer hover:opacity-90 transition-opacity"
          />
        </Link>
        <Link href={`/profile/${(session.user as any).id}`}>
          <Typography variant="subtitle1" className="font-bold hover:underline cursor-pointer text-blue-900 text-center">
            {profile?.name || session.user.name || "User"}
          </Typography>
        </Link>
        <Typography variant="body2" color="text.secondary" className="text-center mt-1">
          {profile?.headline || "Add a headline"}
        </Typography>
      </Box>
      <Divider className="bg-blue-50" />
      <Box className="py-3">
        <Link href="/network" className="block hover:bg-blue-50">
          <Box className="flex justify-between items-center px-4 py-1 cursor-pointer">
            <Typography variant="body2" color="text.secondary" className="font-semibold text-xs">
              Connections
            </Typography>
            <Typography variant="body2" className="text-blue-600 font-bold text-xs">
              {connectionsCount}
            </Typography>
          </Box>
          <Box className="px-4 py-1 cursor-pointer">
            <Typography variant="body2" color="text.primary" className="font-semibold text-xs text-blue-800 hover:underline">
              Grow your network
            </Typography>
          </Box>
        </Link>
      </Box>
      <Divider className="bg-blue-50" />
      <Box className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-2">
        <Typography variant="body2" className="font-semibold text-xs text-blue-800">
          My items
        </Typography>
      </Box>
    </Card>
  );
};

export default Sidebar;

