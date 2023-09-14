import { Box } from '@mui/material';

const colourBackground = {
  high: 'rgba(229, 107, 107, 0.22)',
  medium: 'rgba(255, 107, 0, 0.3)',
  low: 'rgba(131, 201, 106, 0.3)',
};
const fontColour = {
  high: '#E76A6A',
  medium: '#DA7730',
  low: '#3FBE7F',
};
const TaskPriority = ({ isOverdue, priority, isLarge = false }) => {
  const boxStyle = isLarge
    ? {
        fontSize: '13px',
        width: 'fit-content',
        height: 'fit-content',
        px: '10px',
        py: '4px',
        borderRadius: '6px',
        '&:hover': {
          cursor: 'pointer',
        },
        '&:active': {
          boxShadow: 'none',
        },
      }
    : {};

  return (
    <Box
      sx={{
        fontSize: isLarge ? '12px' : '10px',
        color: isOverdue ? '#FF6C74' : fontColour[priority],
        backgroundColor: isOverdue ? '#FF6C7422' : colourBackground[priority],
        width: 'fit-content',
        height: 'fit-content',
        px: '6px',
        borderRadius: '3px',
        mt: '3px',
        border: isOverdue ? '1px solid #FF6C74' : 'none',
        ...boxStyle,
      }}
    >
      {isOverdue ? 'OVERDUE' : priority.toUpperCase()}
    </Box>
  );
};
export default TaskPriority;
