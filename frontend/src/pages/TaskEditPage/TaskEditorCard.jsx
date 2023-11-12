import { Box, Typography, Divider } from '@mui/material';
import { Editor } from '../../components';
import TaskActionBtnGroup from './TaskActionBtnGroup';

const TaskEditorCard = ({
  name,
  taskId,
  taskBlocks,
  index,
  activeCard,
  setActiveCard,
}) => {
  return (
    <Box
      className="task-editor-card"
      key={index}
      sx={{
        mt: 5,
        maxWidth: '750px',
        border:
          activeCard === taskId ? '0.5px solid #cfcfcf' : '0.5px solid #efefef',
        boxShadow:
          activeCard === taskId
            ? 'rgba(100, 100, 111, 0.25) 0px 8px 28px 0px'
            : 'none',
        borderRadius: 3,
        p: 2,
        mx: 'auto',
        '&:has(.ProseMirror-focused)': {
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'rgba(100, 100, 111, 0.25) 0px 8px 28px 0px',
          border: '0.5px solid #cfcfcf',
        },
      }}
      onClick={() => setActiveCard(taskId)}
    >
      <Typography
        id={taskId}
        sx={{
          fontSize: '24px',
          fontWeight: 600,
          mb: 1,
          scrollMarginTop: '5rem',
        }}
      >
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
