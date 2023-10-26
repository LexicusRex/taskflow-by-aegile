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

  const priorityMap = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High'
  }

  const underlineStyle = {
    textDecoration: 'underline',
    textDecorationColor: 'rgb(227, 113, 113)',
    textDecorationThickness: '1.5px',
    textUnderlineOffset: '3px'
  }

  const diffDeadline = () => {
    if (!compTaskData) {
      return false;
    }
    return taskData.deadline !== compTaskData.deadline;
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
        }}
      >
        <InputLabel>Task Name</InputLabel>
        {compTaskData && taskData.name !== compTaskData.name ? (
          <Typography 
            sx={
              // borderColor: 'rgb(229, 107, 107)',
              // borderStyle: 'solid',
              // borderWidth: '2px',
              // borderRadius: '8px',
              // alignSelf: 'flex-start',
              // px: '5px'
              underlineStyle
            }
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
          <Typography
            sx={{ ...(diffDeadline() && underlineStyle) }}
          >
            {taskData.deadline === 'Invalid Date'
              ? 'No Deadline' : taskData.deadline}
          </Typography>
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
          <Typography
            sx={{
              ...(compTaskData && taskData.weighting !== 
                compTaskData.weighting && underlineStyle)
            }}
          >
            {taskData.weighting}/5
          </Typography>
        </Box>
        {/* Priority */}
        <Box sx={{ width: '50%' }}>
          <InputLabel>Priority</InputLabel>
          <Typography
            sx={{
              ...(compTaskData && taskData.weighting !== 
                compTaskData?.weighting && underlineStyle)
            }}
          >
            {priorityMap[taskData.priority]}
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mb: 2
        }}
      >
        <InputLabel>Description</InputLabel>
        {taskData.description ? (
          <Typography
            sx={{
              ...(diffDesc() && underlineStyle),
              textWrap: 'balanced',
            }}
          >
            {taskData.description}
          </Typography>
        ) : (
          <Typography 
            sx={{
              ...(diffDesc() && underlineStyle)
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
