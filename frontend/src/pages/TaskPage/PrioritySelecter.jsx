import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

export default function PrioritySelecter({ priority, setPriority }) {
  const [borderColourLow, setBorderColourLow] = useState('white');
  const [borderColourMed, setBorderColourMed] = useState('white');
  const [borderColourHi, setBorderColourHi] = useState('white');

  const boxStyle = {
    fontSize: '13px',
    width: 'fit-content',
    height: 'fit-content',
    px: '10px',
    py: '4px',
    borderRadius: '6px',
    '&:hover': {
      cursor: 'pointer',
    },
    '&:active': {
      boxShadow: 'none',
    },
  };

  useEffect(() => {
    setBorderColourLow(priority === 'low' ? '#83C96A' : 'white');
    setBorderColourMed(priority === 'medium' ? '#FF6B00' : 'white');
    setBorderColourHi(priority === 'high' ? '#E15C5C' : 'white');
  }, [priority]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: '3px' }}>
      <Box
        sx={{
          ...boxStyle,
          color: '#3FBE7F',
          backgroundColor: 'rgba(131, 201, 106, 0.3)',
          border: `2px solid ${borderColourLow}`,
        }}
        onClick={() => {
          setPriority('low');
        }}
      >
        LOW
      </Box>
      <Box
        sx={{
          ...boxStyle,
          color: '#DA7730',
          backgroundColor: 'rgba(255, 107, 0, 0.3)',
          border: `2px solid ${borderColourMed}`,
        }}
        onClick={() => {
          setPriority('medium');
        }}
      >
        MEDIUM
      </Box>
      <Box
        sx={{
          ...boxStyle,
          color: '#E76A6A',
          backgroundColor: 'rgba(229, 107, 107, 0.22)',
          border: `2px solid ${borderColourHi}`,
        }}
        onClick={() => {
          setPriority('high');
        }}
      >
        HIGH
      </Box>
    </Box>
  );
}
