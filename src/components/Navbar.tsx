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
    <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'black', borderBottom: '1px solid #e8f3ff', boxShadow: 'none' }}>
      <Toolbar className="max-w-7xl mx-auto w-full flex justify-between">
        <Box className="flex items-center gap-4">
          <Link href="/">
            <Typography variant="h6" component="div" className="text-blue-600 font-bold cursor-pointer">
              LinkedIn Clone
            </Typography>
          </Link>
          <Box className="hidden md:flex items-center bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
            <SearchIcon className="text-blue-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent outline-none text-sm w-48 text-blue-900 placeholder-blue-300"
            />
          </Box>
        </Box>
        
        <Box className="flex items-center gap-6">
          <Link href="/" className="flex flex-col items-center text-blue-400 hover:text-blue-600 transition-colors">
            <HomeIcon />
            <span className="text-xs font-medium mt-1">Home</span>
          </Link>
          <Link href="/network" className="flex flex-col items-center text-blue-400 hover:text-blue-600 transition-colors">
            <PeopleIcon />
            <span className="text-xs font-medium mt-1">My Network</span>
          </Link>
          <Link href="/jobs" className="flex flex-col items-center text-blue-400 hover:text-blue-600 transition-colors">
            <WorkIcon />
            <span className="text-xs font-medium mt-1">Jobs</span>
          </Link>
          <Link href="/messaging" className="flex flex-col items-center text-blue-400 hover:text-blue-600 transition-colors">
            <MessageIcon />
            <span className="text-xs font-medium mt-1">Messaging</span>
          </Link>
          <Link href="/notifications" className="flex flex-col items-center text-blue-400 hover:text-blue-600 transition-colors">
            <NotificationsIcon />
            <span className="text-xs font-medium mt-1">Notifications</span>
          </Link>

          {!mounted || status === 'loading' ? (
            <div className="w-16 h-8"></div>
          ) : session ? (
            <div className="flex items-center gap-4 ml-4">
              <Link href={`/profile/${(session.user as any).id}`} className="flex flex-col items-center text-blue-600 hover:text-blue-800 transition-colors">
                <Avatar src={session.user?.image || ""} sx={{ width: 24, height: 24 }} />
                <span className="text-xs font-bold mt-1">Me</span>
              </Link>
              <Button 
                variant="outlined" 
                size="small" 
                color="primary"
                onClick={() => signOut()}
                className="font-bold normal-case text-xs rounded-full border-blue-200 hover:bg-blue-50"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login" className="ml-4">
              <Button variant="contained" color="primary" size="small" className="rounded-full font-bold normal-case">
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


