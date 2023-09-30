import { createContext, useState } from 'react';
import {
  Box,
  Typography,
  InputLabel,
  AvatarGroup,
  Avatar,
  Tooltip,
} from '@mui/material';
import { fetchAPIRequest } from '../helpers';
import { TaskPriority } from '../pages/TaskPage';

const renderTaskInfo = (taskData) => {
  const splitDate = taskData.deadline?.split('/') || undefined;
  const isOverdue =
    (splitDate &&
      Date.parse(`${splitDate[1]}/${splitDate[0]}/${splitDate[2]}`) <=
        Date.now()) ||
    false;

  return (
    <>
      <TaskPriority
        priority={taskData.priority}
        isOverdue={isOverdue}
        isLarge
      />
      <Typography fontSize={20} sx={{ my: 1 }}>
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
      </Box>
    </>
  );
};

export const TaskContext = createContext({
  title: null,
  isOpen: false,
  body: null,
  toggleOn: () => {},
  toggleOff: () => {},
  info: () => {},
  history: () => {},
  comment: () => {},
  complete: () => {},
});

export default function TaskProvider({ children }) {
  const [title, setTitle] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState(null);

  const info = async (taskId) => {
    setBody(null);
    setTitle('Task Info');
    if (taskId === -1) {
      return;
    }
    const taskData = await fetchAPIRequest(`/task/get?taskId=${taskId}`, 'GET');
    setBody(renderTaskInfo(taskData));
    toggleOn();
  };
  const history = (taskId) => {
    setBody(null);
    setTitle('Editor History');
    toggleOn();
  };
  const comment = (taskId) => {
    setBody(null);
    setTitle('Comments');
    toggleOn();
  };
  const complete = (taskId) => {};

  const toggleOn = () => {
    setIsOpen(true);
  };
  const toggleOff = () => {
    setIsOpen(false);
  };

  const clear = () => {
    setTitle(null);
  };

  return (
    <TaskContext.Provider
      value={{
        title,
        isOpen,
        body,
        toggleOn,
        toggleOff,
        info,
        history,
        comment,
        complete,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
