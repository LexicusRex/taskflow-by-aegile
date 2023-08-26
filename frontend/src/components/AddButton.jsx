import { Box } from '@mui/material';
import React from 'react';

export default function AddButton({ onClick }) {
  return (
    <Box
      sx={{
        display: 'flex',
        marginTop: '2px',
      }}
    >
      <Box
        variant='contained'
        sx={{
          display: 'flex',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          backgroundColor: '#F0F3F6',
          justifyContent: 'center',
          textAlign: 'center',
          alignItems: 'center',
          '&:hover': {
            cursor: 'pointer',
          },
        }}
        onClick={onClick}
      >
        <Box
          sx={{
            color: '#4D274D',
            fontSize: '35px',
            marginBottom: '9px',
          }}
        >
          +
        </Box>
      </Box>
    </Box>
  );
}
