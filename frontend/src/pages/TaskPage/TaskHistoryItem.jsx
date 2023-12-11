import { Box, Typography, Checkbox, Avatar, AvatarGroup } from '@mui/material';
import React, { useEffect, useState } from 'react';

export default function TaskHistoryItem({
  taskData,
  prevTaskData,
  projectMembers,
}) {

  const [isChecked, setIsChecked] = useState(false);

  const parseEdits = () => {
    const editedFields = [];
    const fields = ["name", "description", "deadline", "weighting", "priority", "assignees"];

    for (const key of fields) {      
      if (key === "assignees") {
        if (JSON.stringify(taskData[key].sort()) !== JSON.stringify(prevTaskData[key].sort())) {
          editedFields.push(key);
        }
      } else if (taskData[key] !== prevTaskData[key]) {
        editedFields.push(key);
      }
    }
    return editedFields;
  }

  const assigneeNames = (assigneeHandles) => {
    const names = [];
    for (const handle of assigneeHandles) {
      names.push(projectMembers[handle].name);
    }
    return names.join(', ');
  }
 
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
            <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
              {taskData.editName}
            </Typography>
          </Box>

          <Box sx={{ width: '280px', display: 'flex' }}>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 300,
                color: '#7a7a7a',
                whiteSpace: 'normal',
              }}
            >
              {taskData.dateEdited} {'\u00B7'} {taskData.timeEdited}
            </Typography>
          </Box>

          <Box
            sx={{
              pt: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#414141',
                whiteSpace: 'normal',
              }}
            >
              {taskData.editNumber === 0 ? `${[projectMembers[taskData.editor].name]} created the task`
                : `${[projectMembers[taskData.editor].name]} edited the task`  
              }
            </Typography>

            {taskData.editNumber !== 0 && (parseEdits().map((field) => {
              
              return <>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    pt: '3px'
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#414141',
                      whiteSpace: 'normal',
                      textDecoration: 'underline'
                    }}
                  >
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Typography>
        
                  {field === "assignees" ? (
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#414141',
                        whiteSpace: 'normal',
                      }}
                    >
                      {assigneeNames(prevTaskData[field])} {'\u2794'} {assigneeNames(taskData[field])}
                    </Typography>
                  ) : (
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#414141',
                        whiteSpace: 'normal',
                      }}
                    >
                      {prevTaskData[field]} {'\u2794'} {taskData[field]}
                    </Typography>
                  )}
                </Box>
              </>
            }))}
          </Box>
        </Box>
      </Box>
    </>
  )
}