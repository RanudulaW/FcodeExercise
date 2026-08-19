"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'black' }}>
      <Toolbar className="max-w-7xl mx-auto w-full flex justify-between">
        <Box className="flex items-center gap-4">
          <Link href="/">
            <Typography variant="h6" component="div" className="text-blue-600 font-bold cursor-pointer">
              LinkedIn Clone
            </Typography>
          </Link>
          <Box className="hidden md:flex items-center bg-gray-100 px-3 py-1.5 rounded-md">
            <SearchIcon className="text-gray-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent outline-none text-sm w-48"
            />
          </Box>
        </Box>
        
        <Box className="flex items-center gap-6">
          <Link href="/" className="flex flex-col items-center text-gray-500 hover:text-black">
            <HomeIcon />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/network" className="flex flex-col items-center text-gray-500 hover:text-black">
            <PeopleIcon />
            <span className="text-xs">My Network</span>
          </Link>
          <Link href="/jobs" className="flex flex-col items-center text-gray-500 hover:text-black">
            <WorkIcon />
            <span className="text-xs">Jobs</span>
          </Link>
          <Link href="/messaging" className="flex flex-col items-center text-gray-500 hover:text-black">
            <MessageIcon />
            <span className="text-xs">Messaging</span>
          </Link>
          <Link href="/notifications" className="flex flex-col items-center text-gray-500 hover:text-black">
            <NotificationsIcon />
            <span className="text-xs">Notifications</span>
          </Link>

          {!mounted || status === 'loading' ? (
            <div className="w-16 h-8"></div>
          ) : session ? (
            <div className="flex items-center gap-4 ml-4">
              <Link href={`/profile/${(session.user as any).id}`} className="flex flex-col items-center text-gray-500 hover:text-black">
                <Avatar src={session.user?.image || ""} sx={{ width: 24, height: 24 }} />
                <span className="text-xs">Me</span>
              </Link>
              <Button 
                variant="text" 
                size="small" 
                color="error"
                onClick={() => signOut()}
                className="font-semibold normal-case text-xs"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login" className="ml-4">
              <Button variant="outlined" size="small" className="rounded-full font-semibold normal-case">
                Sign In
              </Button>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

