import { Box, Typography } from '@mui/material';
import { Droppable } from 'react-beautiful-dnd';
import TaskDragHandle from './TaskDragHandle';
import TuneIcon from '@mui/icons-material/Tune';
const TaskOrderPanel = ({ taskList, activeCard, setActiveCard }) => {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '280px',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        position: 'fixed',
        left: '250',
        py: '3rem',
        px: '1rem',
        borderRight: '1px solid #cacaca',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: '0.5rem',
        }}
      >
        <Typography variant="h5" fontWeight={500}>
          All Tasks
        </Typography>
        <TuneIcon />
      </Box>
      <Droppable droppableId="task-editor-list">
        {(provided) => (
          <ul
            className="list-item"
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ height: '100%', flexGrow: 1 }}
          >
            {taskList.map((task, index) => (
              <TaskDragHandle
                key={'task-draggable' + task.id}
                taskId={task.id}
                taskName={task.name}
                index={index}
                activeCard={activeCard}
                setActiveCard={setActiveCard}
              />
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </Box>
  );
};
export default TaskOrderPanel;
