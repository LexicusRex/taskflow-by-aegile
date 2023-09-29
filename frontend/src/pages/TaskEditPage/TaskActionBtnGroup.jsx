import { Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import CommentIcon from '@mui/icons-material/Comment';
import DoneIcon from '@mui/icons-material/Done';
import TaskActionBtn from './TaskActionBtn';

const TaskActionBtnGroup = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: 200,
        justifyContent: 'space-evenly',
      }}
    >
      <TaskActionBtn tooltip="Task Info" icon={<InfoIcon />} />
      <TaskActionBtn tooltip="Task Editor History" icon={<HistoryIcon />} />
      <TaskActionBtn tooltip="Comment on task" icon={<CommentIcon />} />
      <TaskActionBtn
        tooltip="Mark task as complete"
        icon={<DoneIcon />}
        sidebarOff
      />
    </Box>
  );
};
export default TaskActionBtnGroup;
