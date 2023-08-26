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
  setIsEdit,
  isLoading,
  incrementLoadedCount,
  isTaskPage,
  showStatus = false,
  hasBoxShadow = false,
}) {
  const { isModalShown, toggleModal } = useModal();
  const [btnLock, setBtnLock] = useState(false);
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
    const bodyData = {
      projectId,
      taskId: id,
      name,
      description,
      deadline,
      status: 'completed',
      attachment,
      attachmentName,
      weighting,
      priority,
      assignees,
    };
    try {
      await fetchAPIRequest('/task/update/specs', 'PUT', bodyData);
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
          modalTitle='Edit Task'
        >
          <TaskForm
            purpose={'edit'}
            toggleModal={toggleModal}
            taskData={{
              id: id,
              projectId: projectId,
              name: name,
              description: description,
              deadline: deadline,
              status: status,
              attachment: attachment,
              attachmentName: attachmentName,
              weighting: weighting,
              priority: priority,
              assignees: assignees,
            }}
            setIsEdit={setIsEdit}
          />
        </Modal>
      )}
      <Box
        sx={{
          width: '250px',
          height: '170px',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxSizing: 'border-box',
          border: '1px solid #fff',
          transition: 'border-color 0.5s',
          boxShadow: hasBoxShadow && 3,
          '&:hover': {
            cursor: isTaskPage && 'pointer',
            borderColor: '#B4B4B4',
            transitionTimingFunction: 'ease-in-out',
          },
        }}
        onClick={toggleModal}
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
                variant='rounded'
                width={75}
                height={14}
                sx={{ mt: '3px' }}
              />
            ) : (
              <Box
                sx={{
                  fontSize: '10px',
                  color: isOverdue ? '#FF6C74' : fontColour[priority],
                  backgroundColor: isOverdue
                    ? '#FF6C7422'
                    : colourBackground[priority],
                  width: 'fit-content',
                  height: 'fit-content',
                  px: '6px',
                  borderRadius: '3px',
                  mt: '3px',
                  border: isOverdue ? '1px solid #FF6C74' : 'none',
                }}
              >
                {isOverdue ? 'OVERDUE' : priority.toUpperCase()}
              </Box>
            )}
            <Box
              sx={{
                color: '#8A8A8A',
                fontSize: '13px',
                marginLeft: 'auto',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {showStatus &&
                !isLoading &&
                !isCardLoading &&
                (status === 'inprogress'
                  ? 'IN PROGRESS'
                  : status === 'notstarted'
                  ? 'NOT STARTED'
                  : status.toUpperCase())}{' '}
              {!isLoading && !isCardLoading && `#${id}`}
            </Box>
          </Box>
          {/* Name of presentation */}
          {isLoading || isCardLoading ? (
            <Skeleton
              variant='rounded'
              width='90%'
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
            <Skeleton variant='rounded' width='100%' height={30} />
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
              variant='rounded'
              width='30%'
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
                  <Skeleton variant='circular' width={30} height={30} />
                  <Skeleton variant='circular' width={30} height={30} />
                  <Skeleton variant='circular' width={30} height={30} />
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
                      !showStatus && isHover && status !== 'completed' ? 0 : 1,
                    marginRight: !showStatus && status !== 'completed' && -35,
                  }}
                >
                  <SpeedIcon sx={{ mr: 0.5 }} /> {weighting}
                </div>
              )}
              {!showStatus &&
                !isLoading &&
                !isCardLoading &&
                status !== 'completed' && (
                  <Tooltip title='Complete task' placement='top'>
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
    </>
  );
}
