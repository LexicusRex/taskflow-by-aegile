import {
  Box,
  Typography,
  IconButton,
  AvatarGroup,
  Avatar,
  Tooltip,
  InputLabel,
  Button,
  Skeleton,
  Divider
} from '@mui/material';
import { Droppable } from 'react-beautiful-dnd';
import TaskPriority from './TaskPriority';
import TaskCard from './TaskCard';
import { Modal } from '../../components';
import useModal from '../../hooks/useModal';
import TaskForm from './TaskForm';
import { useState } from 'react';
import TaskHistoryBtn from './TaskHistoryBtn';

import CloseIcon from '@mui/icons-material/Close';
import SpeedIcon from '@mui/icons-material/Speed';
import EditIcon from '@mui/icons-material/Edit';

const TaskDetails = ({
  taskData,
  subtasks,
  setSelectedTask,
  projectId,
  projectMembers,
  allImagesLoaded,
  handleImageLoad,
  setIsEdit,
  isLoading,
}) => {
  const splitDate = taskData.deadline?.split('/') || undefined;
  const isOverdue =
    (splitDate &&
      Date.parse(`${splitDate[1]}/${splitDate[0]}/${splitDate[2]}`) <=
        Date.now()) ||
    false;
  
  const { isModalShown, toggleModal } = useModal();
  
  const [isSubtaskModalShown, setSubtaskModalShown] = useState(false);
  const toggleSubtaskModal = () => {
    setSubtaskModalShown(!isSubtaskModalShown);
  };

  const statusColour = (stat) => {
    const colours = {
      'blocked': 'rgb(240,102,127)',
      'notstarted': 'rgb(1,148,255)',
      'inprogress': 'rgb(151,71,255)',
      'completed': 'rgb(39,199,112)',
    };
    return colours[stat];
  };

  return (
    <Box
      sx={{
        ml: 2,
        p: 2,
        flexGrow: 1,
        minWidth: '250px',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        // alignItems: 'center',
        boxSize: 'border-box',
        overflowY: 'auto',
        maxHeight: '80dvh',
        backgroundColor: 'rgb(251,249,255)',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        borderStyle: 'solid none none none',
        borderColor: statusColour(taskData.status),
        borderWidth: '3px',
      }}
    >
      <Modal
        isModalShown={isModalShown}
        toggleModal={toggleModal}
        modalTitle="Edit Task"
      >
        <TaskForm
          purpose={'edit'}
          toggleModal={toggleModal}
          taskData={taskData}
          setIsEdit={setIsEdit}
        />
      </Modal>
      <Modal
        isModalShown={isSubtaskModalShown}
        toggleModal={toggleSubtaskModal}
        modalTitle="Create New Subtask"
        purpose="new"
      >
        <TaskForm
          purpose={'create'}
          toggleModal={toggleSubtaskModal}
          parentId={taskData.id}
          taskStatus={'notstarted'}
          setIsEdit={setIsEdit}
        />
      </Modal>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {isLoading ? (
          <Skeleton
            variant="rounded"
            width={80}
            height={25}
            sx={{ mt: '3px' }}
          />
        ) : (
          <TaskPriority
            priority={taskData.priority}
            isOverdue={isOverdue}
            isLarge
          />
        )}
        <Box>
          <IconButton size="small" onClick={toggleModal}>
            <EditIcon />
          </IconButton>
          <TaskHistoryBtn 
            taskId={taskData.id} 
            projectMembers={projectMembers} 
          />
          <IconButton size="small" onClick={() => setSelectedTask({})}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      {isLoading ? (
        <Skeleton
          variant="rounded"
          width="80%"
          height={30}
          sx={{ my: '5px' }}
        />
      ) : (
        <Typography fontSize={24} sx={{ my: 1 }}>
          {taskData.name}
        </Typography>
      )}
      <Box>
        {isLoading ? (
          <Skeleton 
            variant="rounded"
            width="90%"
            height={30}
            sx={{ my: 1 }}
          />
        ) : (
          <Typography
            fontSize={16}
            color="text.secondary"
            sx={{ textWrap: 'balanced' }}
          >
            {taskData.description}
          </Typography>
        )}
        {isLoading ? (
          <Skeleton
            variant="rounded"
            width="35%"
            height={20}
            sx={{ my: '5px' }}
          />
        ) : (
          <Box
            sx={{
              borderRadius: '2px',
              backgroundColor: isOverdue
                ? '#FF6C7433'
                : 'rgba(222, 222, 222, 0.26)',
              border: '0.5px solid #B4B4B4',
              fontSize: '13px',
              fontWeight: 600,
              color: isOverdue ? '#FF6C74' : '#776E6E',
              width: 'fit-content',
              px: 1,
              my: 2,
            }}
          >
            Due:{' '}
            {taskData.deadline === 'Invalid Date'
              ? 'No Deadline'
              : taskData.deadline}
          </Box>
        )}
        
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: '50%' }}>  
            <InputLabel>Members</InputLabel>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {isLoading ? (
                <Box sx={{ display: 'flex' }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              ) : (
                <AvatarGroup 
                  max={3} 
                  sx={{ 
                    my: 1,
                    '& .MuiAvatar-root': {
                      width: 40,
                      height: 40,
                      fontSize: 20,
                    }, 
                  }}
                >
                  {Object.keys(taskData.assigneesData)
                    .filter((handle) => taskData.assignees.includes(handle))
                    .map((handle, index) => (
                      <Tooltip
                        key={'tooltip-' + taskData.assigneesData[handle].handle}
                        title={taskData.assigneesData[handle].name}
                        placement="top"
                      >
                        <Avatar
                          key={taskData.assigneesData[handle].handle}
                          alt={taskData.assigneesData[handle].name}
                          src={taskData.assigneesData[handle].image}
                        >
                          {taskData.assigneesData[handle].name}
                        </Avatar>
                      </Tooltip>
                    ))}
                </AvatarGroup>
              )}
            </Box>
          </Box>
          <Box sx={{ width: '50%' }}>
            <InputLabel>Workload</InputLabel>
            {isLoading ? (
              <Skeleton
                variant="rounded"
                width="15%"
                height={25}
                sx={{ my: '5px' }}
              />
            ) : (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#776E6E',
                  mt: 1,
                }}
              >
                <Box sx={{ display: 'flex', mt: 1 }}>
                  <SpeedIcon sx={{ mr: 0.5 }} />
                  <Typography sx={{ mt: 0.1 }}>{taskData.weighting}</Typography>
                </Box> 
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ my: 1 }}>
          <InputLabel>Attachment</InputLabel>
          {isLoading ? (
            <Skeleton
              variant="rounded"
              width="80%"
              height={25}
              sx={{ my: '5px' }}
            />
          ) : (
            <Typography>{taskData.attachmentName || 'No attachment'}</Typography>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />
      </Box>
      {/* Subtasks */}
      <Button 
        sx={{ mb: 1 }}
        onClick={toggleSubtaskModal}  
      >
        + Add subtask
      </Button>
      <Droppable droppableId="subtask-list">
        {(provided) => (
          <ul
            className="list-item"
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              minHeight: '175px',
              flexGrow: 1,
              width: '248px',
              margin: '0 auto',
            }}
          >
            {subtasks.map((task, index) => (
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
                setIsEdit={setIsEdit}
                isLoading={!allImagesLoaded}
                incrementLoadedCount={handleImageLoad}
                isTaskPage={true}
                index={index}
                setSelectedTask={() => {}}
                setCurrentSubtasks={() => {}}
              />
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </Box>
  );
};
export default TaskDetails;
