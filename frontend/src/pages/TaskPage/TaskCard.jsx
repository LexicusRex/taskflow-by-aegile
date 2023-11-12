import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  AvatarGroup,
  Avatar,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import useModal from '../../hooks/useModal';
import { Modal } from '../../components';
import TaskForm from './TaskForm';
import SpeedIcon from '@mui/icons-material/Speed';
import DoneIcon from '@mui/icons-material/Done';
import { fetchAPIRequest } from '../../helpers';
import { AlertContext } from '../../context/AlertContext';
import { Draggable } from 'react-beautiful-dnd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import TaskPriority from './TaskPriority';
import { ReactComponent as SubtaskIcon } from '../../assets/subtask.svg';

export default function TaskCard({
  id,
  projectId,
  name,
  description,
  deadline,
  status,
  attachment,
  attachmentName,
  weighting,
  priority,
  assignees,
  assigneesData,
  subtasks,
  setIsEdit,
  isLoading,
  incrementLoadedCount,
  isTaskPage,
  index,
  selectedId,
  setSelectedTask,
  setCurrentSubtasks,
  showStatus = false,
  hasBoxShadow = false,
}) {
  const { isModalShown, toggleModal } = useModal();
  const [btnLock, setBtnLock] = useState(false);
  const taskData = {
    id,
    projectId,
    name,
    description,
    deadline,
    status,
    attachment,
    attachmentName,
    weighting,
    priority,
    assignees,
    assigneesData,
  };
  const [isCardLoading, setIsCardLoading] = useState(false); // this was set to true before, causing the tasks to not load
  const [isHover, setIsHover] = useState(false);
  useEffect(() => {
    // Convert handle list to list of assignees
    const getAssignees = async () => {
      isLoading && incrementLoadedCount();
      setIsCardLoading(false);
    };
    getAssignees();
  }, [assignees, isLoading, incrementLoadedCount]);

  const alertCtx = useContext(AlertContext);

  const setCompleted = async () => {
    try {
      await fetchAPIRequest(
        `/task/update/status?taskId=${id}&status=completed`,
        'PUT'
      );
      setIsEdit((prevState) => !prevState);
      alertCtx.success('Task successfully completed!');
      setBtnLock(false);
    } catch (err) {
      console.log(err);
      alertCtx.error(err.message);
    }
  };

  const splitDate = deadline.split('/');
  const isOverdue =
    Date.parse(`${splitDate[1]}/${splitDate[0]}/${splitDate[2]}`) <= Date.now();

  return (
    <>
      {isTaskPage && (
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
      )}
      <Draggable key={'task' + id} draggableId={'task' + id} index={index}>
        {(provided) => (
          <li
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className="task-card-draggable"
          >
            <Box
              sx={{
                width: '250px',
                height: '170px',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxSizing: 'border-box',
                border: '1px solid',
                borderColor: selectedId === id ? '#B4B4B4' : '#ECEFF1',
                transition: 'border-color 0.5s',
                boxShadow: hasBoxShadow && 3,
                '&:hover': {
                  cursor: isTaskPage && 'pointer',
                  borderColor: '#B4B4B4',
                  transitionTimingFunction: 'ease-in-out',
                },
              }}
              onClick={() => {
                setSelectedTask(taskData);
                setCurrentSubtasks(subtasks);
              }}
              // onClick={toggleModal}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              {/* Inner layer */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '150px', // Add this to take full height of the parent box
                  px: 2,
                  py: 1,
                }}
              >
                {/* Top layer */}
                <Box sx={{ display: 'flex' }}>
                  {isLoading || isCardLoading ? (
                    <Skeleton
                      variant="rounded"
                      width={75}
                      height={14}
                      sx={{ mt: '3px' }}
                    />
                  ) : (
                    <TaskPriority isOverdue={isOverdue} priority={priority} />
                  )}
                  <Tooltip title="More options" placement="top">
                    <MoreHorizIcon
                      sx={{ marginLeft: 'auto', color: '#8A8A8A' }}
                      onClick={toggleModal}
                    />
                  </Tooltip>
                </Box>
                {/* Name of presentation */}
                {isLoading || isCardLoading ? (
                  <Skeleton
                    variant="rounded"
                    width="90%"
                    height={30}
                    sx={{ my: '5px' }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: 20,
                      width: 200,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      mt: 1,
                    }}
                  >
                    {name}
                  </Typography>
                )}
                {/* Description */}
                {isLoading || isCardLoading ? (
                  <Skeleton variant="rounded" width="100%" height={30} />
                ) : (
                  <Typography
                    sx={{
                      fontSize: '11px',
                      color: '#776E6E',
                      height: 30,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {description}
                  </Typography>
                )}
                {/* Deadline */}
                {isLoading || isCardLoading ? (
                  <Skeleton
                    variant="rounded"
                    width="30%"
                    height={17}
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
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isOverdue ? '#FF6C74' : '#776E6E',
                      width: 'fit-content',
                      px: 1,
                      my: 'auto',
                    }}
                  >
                    {deadline === 'Invalid Date' ? 'No Deadline' : deadline}
                  </Box>
                )}
                {/* Bottom layer */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {/* People */}
                  <Box sx={{ display: 'flex' }}>
                    {isLoading || isCardLoading ? (
                      <Box sx={{ display: 'flex' }}>
                        <Skeleton variant="circular" width={30} height={30} />
                        <Skeleton variant="circular" width={30} height={30} />
                        <Skeleton variant="circular" width={30} height={30} />
                      </Box>
                    ) : (
                      <AvatarGroup
                        max={4}
                        sx={{
                          '& .MuiAvatar-root': {
                            width: 30,
                            height: 30,
                            fontSize: 14,
                          },
                        }}
                      >
                        {Object.keys(assigneesData)
                          .filter((handle) => assignees.includes(handle))
                          .map((handle, index) => (
                            <Avatar
                              key={assigneesData[handle].handle}
                              alt={assigneesData[handle].name}
                              src={assigneesData[handle].image}
                              sx={{ ml: -2 }}
                            >
                              {assigneesData[handle].name}
                            </Avatar>
                          ))}
                      </AvatarGroup>
                    )}
                  </Box>
                  {/* Weight */}
                  <Box
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#776E6E',
                      marginLeft: 'auto',
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {!isLoading && !isCardLoading && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.3s ease-in-out',
                          visibility:
                            !showStatus && isHover && status !== 'completed'
                              ? 'hidden'
                              : 'visible',
                          opacity:
                            !showStatus && isHover && status !== 'completed'
                              ? 0
                              : 1,
                          marginRight:
                            !showStatus && status !== 'completed' && -35,
                        }}
                      >
                        {subtasks?.length > 0 ? (
                          <>
                            <SubtaskIcon
                              style={{
                                width: '25px',
                                height: '25px',
                                marginRight: '0.2rem',
                              }}
                            />
                            {subtasks.length}
                          </>
                        ) : (
                          <>
                            <SpeedIcon sx={{ mr: 0.5 }} /> {weighting}
                          </>
                        )}
                      </div>
                    )}
                    {!showStatus &&
                      !isLoading &&
                      !isCardLoading &&
                      status !== 'completed' && (
                        <Tooltip title="Complete task" placement="top">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              if (btnLock) return;
                              setBtnLock(true);
                              setCompleted();
                            }}
                            sx={{
                              width: 30,
                              height: 30,
                              transition: 'all 0.3s ease-in-out',
                              visibility: isHover ? 'visible' : 'hidden',
                              opacity: isHover ? 1 : 0,
                            }}
                          >
                            <DoneIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </li>
        )}
      </Draggable>
    </>
  );
}
