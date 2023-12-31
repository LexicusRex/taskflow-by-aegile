import { createContext, useState } from 'react';
import {
  Box,
  Typography,
  InputLabel,
  AvatarGroup,
  Avatar,
  Tooltip,
  IconButton,
  TextField,
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import { fetchAPIRequest } from '../helpers';
import { TaskPriority } from '../pages/TaskPage';
import TaskHistoryOutline from '../pages/TaskEditPage/TaskHistoryOutline';
import Comment from '../components/Comment';
import CommentThread from '../components/CommentThread';

const renderTaskInfo = (taskData) => {
  console.log(taskData);
  const splitDate = taskData?.deadline?.split('/') || 'Invalid Date';
  const isOverdue =
    (splitDate &&
      Date.parse(`${splitDate[1]}/${splitDate[0]}/${splitDate[2]}`) <=
        Date.now()) ||
    false;

  return (
    <>
      <TaskPriority
        priority={taskData?.priority}
        isOverdue={isOverdue}
        isLarge
      />
      <Typography fontSize={20} sx={{ my: 1 }}>
        {taskData?.name}
      </Typography>
      <Box sx={{ px: 2 }}>
        <Typography
          fontSize={16}
          color="text.secondary"
          sx={{ my: 1, textWrap: 'balanced' }}
        >
          {taskData?.description}
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

const renderTaskEditHistory = (editHistory) => {
  return editHistory.map((edit, index) => (
    <TaskHistoryOutline
      index={index}
      editTimestamp={edit.time}
      editContent={edit.content}
    />
  ));
};

const renderTaskComments = (
  commentData,
  setReplyUser,
  setReplyId,
  setIsReplying
) => {
  return commentData.map((comment, cmntIndex) => {
    return (
      <CommentThread
        parent={comment}
        replies={comment?.replies}
        setReplyUser={(user) => setReplyUser(user)}
        setReplyId={(id) => setReplyId(id)}
        setIsReplying={(state) => setIsReplying(state)}
      />
    );
  });
};

export const TaskContext = createContext({
  title: null,
  type: null,
  isOpen: false,
  body: null,
  isReplying: false,
  replyId: null,
  replyTaskId: null,
  replyUser: null,
  toggleOn: () => {},
  toggleOff: () => {},
  info: () => {},
  history: () => {},
  comment: () => {},
  complete: () => {},
  cancelReply: () => {},
  refresh: () => {},
});

export default function TaskProvider({ children }) {
  const [title, setTitle] = useState(null);
  const [type, setType] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState(null);
  const [action, setAction] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyUser, setReplyUser] = useState('');
  const [replyId, setReplyId] = useState(-1);
  const [replyTaskId, setReplyTaskId] = useState(-1);
  const [isRefresh, setIsRefresh] = useState(false);

  const info = async (taskId) => {
    clear();
    setType('info');
    setTitle('Task Info');
    if (taskId === -1) {
      return;
    }
    const taskData = await fetchAPIRequest(`/task/get?taskId=${taskId}`, 'GET');
    setBody(renderTaskInfo(taskData));
    toggleOn();
  };
  const history = async (taskId) => {
    clear();
    setTitle('Editor History');
    setType('history');
    const history = await fetchAPIRequest(
      `/task/edit/history?taskId=${taskId}`,
      'GET'
    );
    console.log(history);
    setBody(renderTaskEditHistory(history));
    toggleOn();
  };
  const comment = async (taskId) => {
    clear();
    setType('comments');
    setTitle('Comments');
    if (taskId === -1) {
      return;
    }

    const commentData = await fetchAPIRequest(
      `/task/get/comment?taskId=${taskId}`,
      'GET'
    );
    setReplyTaskId(taskId);
    setBody(
      renderTaskComments(commentData, setReplyUser, setReplyId, setIsReplying)
    );

    toggleOn();
  };
  const complete = (taskId) => {};

  const toggleOn = () => {
    setIsOpen(true);
  };
  const toggleOff = () => {
    setIsOpen(false);
  };

  const cancelReply = () => {
    setIsReplying(false);
  };

  const clear = () => {
    setBody(null);
    setAction(null);
  };

  const refresh = () => {
    setIsRefresh((prev) => !prev);
  };

  return (
    <TaskContext.Provider
      value={{
        title,
        type,
        isOpen,
        body,
        action,
        isReplying,
        replyId,
        replyTaskId,
        replyUser,
        toggleOn,
        toggleOff,
        info,
        history,
        comment,
        complete,
        cancelReply,
        refresh,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}
