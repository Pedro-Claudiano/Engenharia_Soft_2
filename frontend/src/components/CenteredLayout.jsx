// src/components/CenteredLayout.jsx

import React from 'react';
import { Box } from '@mui/material';

export default function CenteredLayout({ children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f0f2f5',
      }}
    >
      {children}
    </Box>
  );
}