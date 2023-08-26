import React from 'react';
import { SnackbarContent } from 'notistack';
import { Alert, AlertTitle } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import TaskIcon from '@mui/icons-material/Task';
import CommentIcon from '@mui/icons-material/Comment';
import ProjectIcon from '@mui/icons-material/AccountTreeOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const styleMappings = {
  connection: { icon: <GroupIcon />, type: 'Connection', color: 'primary' },
  task: { icon: <TaskIcon />, type: 'Task', color: 'primary' },
  comment: { icon: <CommentIcon />, type: 'Comment', color: 'primary' },
  project: { icon: <ProjectIcon />, type: 'Project', color: 'primary' },
  achievement: {
    icon: <EmojiEventsIcon />,
    type: 'Achievement',
    color: 'primary',
  },
};

const NotificationAlert = React.forwardRef((props, ref) => {
  const { id, message, type, setClose } = props;

  return (
    <SnackbarContent ref={ref} role='alert'>
      <Alert
        severity={type in styleMappings ? styleMappings[type].color : type}
        icon={type in styleMappings ? styleMappings[type].icon : ''}
        sx={{
          maxWidth: 400,
          border: '0.5px solid #00000020',
          whiteSpace: 'pre-line',
        }}
        onClose={() => setClose(id)}
      >
        <AlertTitle>{type.charAt(0).toUpperCase() + type.slice(1)}</AlertTitle>
        {message}
      </Alert>
    </SnackbarContent>
  );
});

export default NotificationAlert;
