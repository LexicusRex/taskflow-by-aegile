import {
  Box,
  Divider,
  Button,
  Typography,
  Avatar,
  AvatarGroup,
  Tooltip
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import { fetchAPIRequest } from '../../helpers';
import TaskPriority from './TaskPriority';
import SpeedIcon from '@mui/icons-material/Speed';

const dummyMembers = [
  {
    name: 'Alex Xu',
    handle: 'alexxu123' 
  },
  {
    name: 'Philip Tran',
    handle: 'philiptran123' 
  },
]

const TaskInfoList = ({
  toggleModal,
  purpose,
  taskData,
  compTaskData
}) => {
 
  // Rendering of comments
  const [isHovered, setIsHovered] = useState(false);

  // Auto scroll to the bottom
  const scrollRef = useRef(null);

  // Scroll useEffect
  useEffect(() => {
    if (scrollRef.current && isHovered) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [isHovered]);

  // useEffect(() => {
  //   const getConnections = async () => {
  //     const connections = await fetchAPIRequest(
  //       `/connections/task?projectId=${projectId}`,
  //       'GET'
  //     );
  //     setConnections(connections);
  //     purpose !== 'edit' && setMembers([Object.keys(connections)[0]]);
  //   };
  //   getConnections();
  // }, [projectId, purpose, taskData, isNewComment]);

  const statusMap = {
    'notstarted': 'Not Started',
    'inprogress': 'In Progress',
    'completed': 'Completed',
    'blocked': 'Blocked'
  }

  const dateColour = () => {
    if (!compTaskData || taskData.deadline === compTaskData.deadline) {
      return 'rgba(222, 222, 222, 0.26)';
    }
    if (taskData.deadline === 'Invalid Date' || compTaskData.deadline === 'Invalid Date') {
      return 'rgba(255, 107, 0, 0.4)';
    }
    const splitA = taskData.deadline.split("/");
    const splitB = compTaskData.deadline.split("/");
    const dateObjA = Date.parse(`${splitA[1]}/${splitA[0]}/${splitA[2]}`);
    const dateObjB = Date.parse(`${splitB[1]}/${splitB[0]}/${splitB[2]}`);
    
    if (dateObjA > dateObjB) {
      return 'rgba(131, 201, 106, 0.6)';
    } else if (dateObjA < dateObjB) {
      return 'rgba(229, 107, 107, 0.5)';
    } else {
      return 'rgba(222, 222, 222, 0.26)';
    }
  }

  const diffDesc = () => {
    if (!compTaskData) {
      return 0;
    }
    return taskData.description !== compTaskData.description;
  }

  return (
    <Box onClick={(e) => {e.stopPropagation()}}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column' 
      }}>
        {purpose === 'compare' && (
          <>
            <Box>
              <Typography variant="h5" sx={{ mb: 0.5 }}>
                {`${taskData.editName} - ${taskData.date_edited}`}
              </Typography>
            </Box>
          </>
        )}
        
        <Box>
          <Typography 
            variant={purpose === "compare" ? "h6" : "h5"} 
            sx={{ mb: 2 }}
          >
            Edited by {taskData.editor}
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            Task Details
          </Typography>
        </Box>
      </Box>
      
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <InputLabel>Task Name</InputLabel>
        {compTaskData && taskData.name !== compTaskData.name ? (
          <Typography 
            sx={{
              backgroundColor: 'yellow',
              alignSelf: 'flex-start'
            }}
          >
            {taskData.name}
          </Typography>
        ) : (
          <Typography>{taskData.name}</Typography>
        )}
      </Box>
      
      {/* Status and deadline */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ width: '50%' }}>
          <InputLabel>Status</InputLabel>
          <Typography>{statusMap[taskData.status]}</Typography>
        </Box>
        <Box sx={{ width: '50%' }}>
          <InputLabel>Deadline</InputLabel>
          <Box
            sx={{
              borderRadius: '2px',
              backgroundColor: dateColour(),
              border: '0.5px solid #B4B4B4',
              fontSize: '13px',
              fontWeight: 600,
              color: '#776E6E',
              width: 'fit-content',
              px: 1,
              mt: 0.5,
            }}
          >
            {taskData.deadline === 'Invalid Date'
              ? 'No Deadline'
              : taskData.deadline}
          </Box>
        </Box>
      </Box>
      {/* Priority and Weighting */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
        }}
      >
        {/* Slider */}
        <Box sx={{ width: '50%' }}>
          <InputLabel>Work Load</InputLabel>
          <Box
            sx={{
              maxWidth: '300px',
              minWidth: '100px',
              display: 'flex',
              gap: 2,
              mt: '3px',
            }}
          >
            {/* Weight display */}
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#776E6E',
                mt: 1,
                ...(compTaskData && taskData.weighting !== 
                  compTaskData.weighting && {
                  backgroundColor: 'rgb(255, 194, 89)'
                })
              }}
            >
              <SpeedIcon sx={{ mr: 0.5 }} />
              <Typography sx={{ mt: 0.2 }}>{taskData.weighting}</Typography>
            </Box>
          </Box>
        </Box>
        {/* Priority */}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
          <InputLabel>Priority</InputLabel>
          <TaskPriority 
            priority={taskData.priority}
            isLarge 
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mb: 2
        }}
      >
        <InputLabel sx={{ mb: '4px' }}>Description</InputLabel>
        {taskData.description ? (
          <Typography
            sx={{
              ...(diffDesc() && {
                backgroundColor: 'rgb(99, 239, 255)',
                alignSelf: 'flex-start'
              }),
              textWrap: 'balanced',
            }}
          >
            {taskData.description}
          </Typography>
        ) : (
          
          <Typography 
            sx={{
              ...(diffDesc() && {
                backgroundColor: 'rgb(99, 239, 255)',
                alignSelf: 'flex-start'
              })
            }}
          >
            No description
          </Typography>
        )}

      </Box>

      {/* Members */}
      <Box
        sx={{
          mb: 2
        }}
      >
        <InputLabel>Members</InputLabel>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <AvatarGroup /*max={4}*/ sx={{ my: 1 }}>
            {dummyMembers.map((member, index) => (
              <Tooltip
                key={'tooltip-' + member.handle}
                title={member.name}
                placement="top"
              >
                <Avatar
                  key={member.handle}
                  alt={member.name}
                  //src={taskData.assigneesData[handle].image}
                >
                  {member.name}
                </Avatar>
              </Tooltip>
            ))}
          </AvatarGroup>
        </Box>
      </Box>
      {/* Attachments */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
        <InputLabel>Attachments</InputLabel>
        {taskData.attachment ? (
          <Link
            href={taskData.attachment}
            download={taskData.attachment_name}
            sx={{ mb: 1 }}
          >
            {taskData.attachment_name}
          </Link>
        ) : (
          <Typography>
            No attachment
          </Typography>
        )}

      </Box>
      {/* Bottom Section */}
      {purpose !== 'compare' && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
            <Button
              color="primary"
              fullWidth
              variant="outlined"
              onClick={(e) => {
                toggleModal();
              }}
              margin="dense"
              sx={{ ml: 1, borderRadius: '10px' }}
            >
              Close
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};
export default TaskInfoList;
