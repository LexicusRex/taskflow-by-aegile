import { Box, Typography } from '@mui/material';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Draggable } from 'react-beautiful-dnd';

function smoothScrollToTarget(targetId) {
  const target = document.getElementById(targetId);

  target.scrollIntoView({
    scroll: target.offsetTop,
    behavior: 'smooth',
  });
}

const TaskDragHandle = ({
  index,
  taskId,
  taskName,
  activeCard,
  setActiveCard,
}) => {
  return (
    <Draggable
      key={'task-draggable' + taskId}
      draggableId={'task' + taskId}
      index={index}
    >
      {(provided) => (
        <li
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          className="task-card-draggable"
        >
          <Box
            key={'task-drag-handle' + taskId}
            sx={{
              backgroundColor: activeCard === taskId ? '#dad6f7' : '#fff',
              border: '0.25px solid transparent',
              transition: 'all 0.2s ease-in-out',
              fontSize: '1.5rem',
              '&:hover, &:active': {
                boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
                border: '0.25px solid #cfcfcf',
              },
              width: '100%',
              height: '52px',
              py: 4,
              px: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 3,
              boxSizing: 'border-box',
            }}
          >
            <a
              href={`#${taskId}`}
              className="link"
              onClick={(e) => {
                e.preventDefault();
                setActiveCard(taskId);
                smoothScrollToTarget(taskId);
              }}
            >
              <Typography className="ellipsis-break" sx={{ width: '180px' }}>
                {taskName}
              </Typography>
            </a>
            <DragHandleIcon sx={{ color: '#cacaca' }} />
          </Box>
        </li>
      )}
    </Draggable>
  );
};
export default TaskDragHandle;
