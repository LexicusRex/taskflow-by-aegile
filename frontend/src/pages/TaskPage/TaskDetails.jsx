import {
  Box,
  Typography,
  IconButton,
  AvatarGroup,
  Avatar,
  Tooltip,
  InputLabel,
  Button,
} from '@mui/material';
import { Droppable } from 'react-beautiful-dnd';
import TaskPriority from './TaskPriority';
import TaskCard from './TaskCard';

import CloseIcon from '@mui/icons-material/Close';
import SpeedIcon from '@mui/icons-material/Speed';

const TaskDetails = ({
  taskData,
  subtasks,
  setSelectedTask,
  projectId,
  projectMembers,
  allImagesLoaded,
  handleImageLoad,
  setIsEdit,
}) => {
  const splitDate = taskData.deadline?.split('/') || undefined;
  const isOverdue =
    (splitDate &&
      Date.parse(`${splitDate[1]}/${splitDate[0]}/${splitDate[2]}`) <=
        Date.now()) ||
    false;

  return (
    <Box
      sx={{
        px: 2,
        py: 2,
        flexGrow: 1,
        width: '320px',
        display: 'flex',
        flexDirection: 'column',
        // alignItems: 'center',
        boxSize: 'border-box',
        overflowY: 'auto',
        maxHeight: '80dvh',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <TaskPriority
          priority={taskData.priority}
          isOverdue={isOverdue}
          isLarge
        />
        <IconButton size="small" onClick={() => setSelectedTask({})}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography fontSize={24} sx={{ my: 1 }}>
        {taskData.name}
      </Typography>
      <Box sx={{ px: 2 }}>
        <Typography
          fontSize={16}
          color="text.secondary"
          sx={{ my: 1, textWrap: 'balanced' }}
        >
          {taskData.description}
        </Typography>
        <Box
          sx={{
            borderRadius: '2px',
            backgroundColor: isOverdue
              ? '#FF6C7433'
              : 'rgba(222, 222, 222, 0.26)',
            border: '0.5px solid #B4B4B4',
            fontSize: '13px',
            fontWeight: 600,
            color: isOverdue ? '#FF6C74' : '#776E6E',
            width: 'fit-content',
            px: 1,
            my: 2,
          }}
        >
          Due:{' '}
          {taskData.deadline === 'Invalid Date'
            ? 'No Deadline'
            : taskData.deadline}
        </Box>
        <InputLabel>Members</InputLabel>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <AvatarGroup /*max={4}*/ sx={{ my: 1 }}>
            {Object.keys(taskData.assigneesData)
              .filter((handle) => taskData.assignees.includes(handle))
              .map((handle, index) => (
                <Tooltip
                  key={'tooltip-' + taskData.assigneesData[handle].handle}
                  title={taskData.assigneesData[handle].name}
                  placement="top"
                >
                  <Avatar
                    key={taskData.assigneesData[handle].handle}
                    alt={taskData.assigneesData[handle].name}
                    src={taskData.assigneesData[handle].image}
                  >
                    {taskData.assigneesData[handle].name}
                  </Avatar>
                </Tooltip>
              ))}
          </AvatarGroup>
        </Box>
        <InputLabel>Workload</InputLabel>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#776E6E',
            mt: 1,
          }}
        >
          <SpeedIcon sx={{ mr: 0.5 }} />
          <Typography sx={{ mt: 0.2 }}>{taskData.weighting}</Typography>
        </Box>
        <Box sx={{ my: 1 }}>
          <InputLabel>Attachment</InputLabel>
          <Typography>{taskData.attachmentName || 'No attachment'}</Typography>
        </Box>
      </Box>
      {/* Subtasks */}
      <Button sx={{ mb: 1 }}>+ Add subtask</Button>
      <Droppable droppableId="subtask-list">
        {(provided) => (
          <ul
            className="list-item"
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              minHeight: '175px',
              flexGrow: 1,
              width: '248px',
              margin: '0 auto',
            }}
          >
            {subtasks.map((task, index) => (
              <TaskCard
                key={task.id}
                id={task.id}
                projectId={projectId}
                name={task.name}
                description={task.description}
                deadline={task.deadline}
                status={task.status}
                attachment={task.attachment}
                attachmentName={task.attachmentName}
                weighting={task.weighting}
                priority={task.priority}
                assignees={task.assignees}
                assigneesData={projectMembers}
                setIsEdit={setIsEdit}
                isLoading={!allImagesLoaded}
                incrementLoadedCount={handleImageLoad}
                isTaskPage={true}
                index={index}
                setSelectedTask={() => {}}
                setCurrentSubtasks={() => {}}
              />
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </Box>
  );
};
export default TaskDetails;
