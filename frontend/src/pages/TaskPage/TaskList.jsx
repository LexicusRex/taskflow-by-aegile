import StatusLabel from './StatusLabel';
import { Box } from '@mui/material';
import TaskCard from './TaskCard';
import { Droppable } from 'react-beautiful-dnd';

const TaskList = ({
  taskList,
  listId,
  labelText,
  projectId,
  projectMembers,
  allImagesLoaded,
  handleImageLoad,
  setIsEdit,
  selectedId,
  setSelectedTask,
  setCurrentSubtasks,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <StatusLabel status={labelText} setIsEdit={setIsEdit} />
      <Droppable droppableId={listId}>
        {(provided) => (
          <ul
            className="list-item"
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ height: '100%' }}
          >
            {taskList.map((task, index) => (
              <TaskCard
                key={task.id}
                id={task.id}
                projectId={projectId}
                name={task.name}
                description={task.description}
                deadline={task.deadline}
                status={task.status}
                attachment={task.attachment}
                attachmentName={task.attachmentName}
                weighting={task.weighting}
                priority={task.priority}
                assignees={task.assignees}
                assigneesData={projectMembers}
                subtasks={task.subtasks}
                setIsEdit={setIsEdit}
                isLoading={!allImagesLoaded}
                incrementLoadedCount={handleImageLoad}
                isTaskPage={true}
                index={index}
                selectedId={selectedId}
                setSelectedTask={setSelectedTask}
                setCurrentSubtasks={setCurrentSubtasks}
              />
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </Box>
  );
};
export default TaskList;
