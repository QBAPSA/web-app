import React from 'react';
import { Box } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <Box sx={{ p: 3 }}>
      {children}
    </Box>
  );
};

export default Layout;
