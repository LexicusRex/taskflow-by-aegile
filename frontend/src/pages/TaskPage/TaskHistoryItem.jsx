import { Box, Typography, Checkbox, Avatar, AvatarGroup } from '@mui/material';
import React, { useState } from 'react';

export default function TaskHistoryItem({
  taskData,
  projectMembers
}) {

  const [isChecked, setIsChecked] = useState(false);

  return (
    <>
      <Box
        sx={{ 
          display: 'flex',
          alignItems: 'center', 
          minHeight: '60px', 
          width: '100%', 
          px: '16px',
          py: '6px'
        }}
        onClick={() => setIsChecked((prev) => !prev)}
      >
        <Checkbox disableRipple checked={isChecked} />

        <Avatar
          key={taskData.editor}
          alt={projectMembers[taskData.editor].name}
          src={projectMembers[taskData.editor].image}
          sx={{ mr: 1 }}
        >
          {projectMembers[taskData.editor].name}
        </Avatar>

        <Box
          sx={{
            ml: '10px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Name and time */}
          <Box sx={{ display: 'flex', width: '230px' }}>
            <Typography sx={{ fontSize: '17px', fontWeight: 600 }}>
              {taskData.editName}
            </Typography>
          </Box>
          <Box sx={{ width: '280px', display: 'flex' }}>
            {taskData.editNumber === 0 ? (
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#414141',
                  whiteSpace: 'normal',
                }}
              >
                Created on {taskData.dateEdited} at {taskData.timeEdited}
              </Typography>
            ) : (
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#414141',
                  whiteSpace: 'normal',
                }}
              >
                Edited on {taskData.dateEdited} at {taskData.timeEdited}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </>
  )
}