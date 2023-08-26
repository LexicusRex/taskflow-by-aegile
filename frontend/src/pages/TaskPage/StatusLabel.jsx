import React from 'react';
import { Box, Typography } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import NewTaskButton from './NewTaskButton';

export default function StatusLabel({ status, setIsEdit }) {
  const convertStatus = (stat) => {
    const converter = {
      Blocked: 'blocked',
      'Not Started': 'notstarted',
      'In Progress': 'inprogress',
      Completed: 'completed',
    };
    return String(converter[stat]);
  };
  return (
    <Box
      sx={{
        mt: 3,
        backgroundColor: 'white',
        width: '250px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box sx={{ px: 2, py: '6px' }}>
        <Typography variant="h6" sx={{}}>
          {status}
        </Typography>
      </Box>
      {/* Buttons */}
      <Box
        sx={{
          display: 'flex',
          marginLeft: 'auto',
          marginRight: '10px',
          gap: '5px',
        }}
      >
        <MoreHorizIcon
          sx={{
            '&:hover': {
              cursor: 'pointer',
            },
            color: '#8A8A8A',
          }}
        />
        <NewTaskButton
          taskStatus={convertStatus(status)}
          setIsEdit={setIsEdit}
        />
      </Box>
    </Box>
  );
}
