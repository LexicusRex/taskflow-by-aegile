import { Box } from '@mui/material';
import { Droppable, Draggable } from 'react-beautiful-dnd';

const TaskOrderPanel = ({ taskList }) => {
  return (
    <Box
      sx={{
        height: '98vh',
        width: '250px',
        backgroundColor: '#fff',
        position: 'absolute',
        left: 0,
        borderRight: '1px solid red',
      }}
    >
      <Droppable droppableId="task-editor-list">
        {(provided) => (
          <ul
            className="list-item"
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ height: '100%' }}
          >
            {taskList.map((task, index) => (
              <Draggable
                key={'task' + task.id}
                draggableId={'task' + task.id}
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
                      sx={{
                        fontSize: '1.5rem',
                        border: '1px solid red',
                        py: 2,
                      }}
                    >
                      <a href={`#${task.id}`}>{task.name}</a>
                    </Box>
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </Box>
  );
};
export default TaskOrderPanel;
