import { Box, Typography, Divider } from '@mui/material';
import { Editor } from '../../components';
import TaskActionBtnGroup from './TaskActionBtnGroup';

const TaskEditorCard = ({ name, taskId, taskBlocks, index }) => {
  return (
    <Box
      key={index}
      sx={{
        mt: 5,
        maxWidth: '750px',
        border: '0.5px solid #efefef',
        borderRadius: 3,
        p: 2,
        mx: 'auto',
      }}
    >
      <Typography id={taskId} sx={{ fontSize: '24px', fontWeight: 600, mb: 1 }}>
        {name}
      </Typography>
      <Editor initialBlocks={taskBlocks} taskId={taskId} />
      <Divider sx={{ my: 2, mx: 25 }} />
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <TaskActionBtnGroup taskId={taskId} />
      </Box>
    </Box>
  );
};
export default TaskEditorCard;
