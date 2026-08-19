import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

const Sidebar = () => {
  return (
    <Card className="rounded-lg overflow-hidden border border-blue-100 shadow-sm mb-4">
      <Box className="relative h-16 bg-blue-600">
        {/* Cover Photo Placeholder */}
      </Box>
      <Box className="flex flex-col items-center px-4 pb-4">
        <Avatar 
          src="" 
          className="w-16 h-16 border-2 border-white -mt-8 mb-2"
        />
        <Typography variant="subtitle1" className="font-bold hover:underline cursor-pointer text-blue-900">
          Welcome, User!
        </Typography>
        <Typography variant="body2" color="text.secondary" className="text-center mt-1">
          Add a headline
        </Typography>
      </Box>
      <Divider className="bg-blue-50" />
      <Box className="py-3">
        <Box className="flex justify-between items-center px-4 py-1 hover:bg-blue-50 cursor-pointer">
          <Typography variant="body2" color="text.secondary" className="font-semibold text-xs">
            Connections
          </Typography>
          <Typography variant="body2" className="text-blue-600 font-bold text-xs">
            0
          </Typography>
        </Box>
        <Box className="px-4 py-1 hover:bg-blue-50 cursor-pointer">
          <Typography variant="body2" color="text.primary" className="font-semibold text-xs text-blue-800">
            Grow your network
          </Typography>
        </Box>
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

