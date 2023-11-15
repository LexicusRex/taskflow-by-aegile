import { Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import CommentIcon from '@mui/icons-material/Comment';
import DoneIcon from '@mui/icons-material/Done';
import TaskActionBtn from './TaskActionBtn';
import { TaskContext } from '../../context/TaskSidePanelContext';
import { useContext } from 'react';

const iconSize = 20;

const TaskActionBtnGroup = ({ taskId }) => {
  const taskCtx = useContext(TaskContext);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: 150,
        justifyContent: 'space-between',
      }}
    >
      <TaskActionBtn
        action={() => taskCtx.info(taskId)}
        tooltip="Task Info"
        icon={<InfoIcon sx={{ width: iconSize }} />}
      />
      <TaskActionBtn
        action={() => taskCtx.history(taskId)}
        tooltip="Task Editor History"
        icon={<HistoryIcon sx={{ width: iconSize }} />}
      />
      <TaskActionBtn
        action={() => taskCtx.comment(taskId)}
        tooltip="Comment on task"
        icon={<CommentIcon sx={{ width: iconSize }} />}
      />
      <TaskActionBtn
        action={() => taskCtx.complete(taskId)}
        tooltip="Mark task as complete"
        icon={<DoneIcon sx={{ width: iconSize }} />}
      />
    </Box>
  );
};
export default TaskActionBtnGroup;
