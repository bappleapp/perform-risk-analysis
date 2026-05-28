// src/components/layout/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import SafetyCheckIcon from '@mui/icons-material/SafetyCheck';

export const Header: React.FC = () => {
  const location = useLocation();

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar className="flex justify-between">
        <Box className="flex items-center space-x-3">
          <SafetyCheckIcon className="text-white" />
          <Typography variant="h6" component="div" className="font-bold">
            PErForM Risk Analysis
          </Typography>
        </Box>
        
        <Box className="flex space-x-4">
          <Button
            color="inherit"
            component={Link}
            to="/"
            variant={location.pathname === '/' ? 'outlined' : 'text'}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/analysis"
            variant={location.pathname.includes('/analysis') ? 'outlined' : 'text'}
          >
            New Analysis
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};