import React from 'react';
import { Box, Typography } from '@mui/material';

export default function MenuButton({ isCurrentTab, btnName, handleClick }) {
  return (
    <Box
      sx={{
        width: 'fit-content',
        backgroundColor: isCurrentTab && 'rgba(131, 120, 227, 0.3)',
        '&:hover': {
          backgroundColor: 'rgba(131, 120, 227, 0.3)',
          cursor: 'pointer',
        },
        borderRadius: '10px',
        px: '15px',
        py: '3px',
      }}
      onClick={() => handleClick(btnName.toLowerCase())}
    >
      <Typography variant="h6">{btnName}</Typography>
    </Box>
  );
}
