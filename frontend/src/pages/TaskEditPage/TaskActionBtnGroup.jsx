import { Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import CommentIcon from '@mui/icons-material/Comment';
import DoneIcon from '@mui/icons-material/Done';
import TaskActionBtn from './TaskActionBtn';
import { TaskContext } from '../../context/TaskSidePanelContext';
import { useContext } from 'react';

const TaskActionBtnGroup = ({ taskId }) => {
  const taskCtx = useContext(TaskContext);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: 200,
        justifyContent: 'space-evenly',
      }}
    >
      <TaskActionBtn
        action={() => taskCtx.info(taskId)}
        tooltip="Task Info"
        icon={<InfoIcon />}
      />
      <TaskActionBtn
        action={() => taskCtx.history(taskId)}
        tooltip="Task Editor History"
        icon={<HistoryIcon />}
      />
      <TaskActionBtn
        action={() => taskCtx.comment(taskId)}
        tooltip="Comment on task"
        icon={<CommentIcon />}
      />
      <TaskActionBtn
        action={() => taskCtx.complete(taskId)}
        tooltip="Mark task as complete"
        icon={<DoneIcon />}
      />
    </Box>
  );
};
export default TaskActionBtnGroup;
