import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';

// Drop down imports
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { fetchAPIRequest } from '../../helpers';
import HistoryIcon from '@mui/icons-material/History';
import TaskHistoryItem from './TaskHistoryItem';
import useModal from '../../hooks/useModal';
import { Modal } from '../../components';
import TaskInfoList from './TaskInfoList';

const dummyHistory = [
  {
    id: 1,
    project: 1,
    name: 'Task 0',
    description: 'Yes sakjghkjrlasehgflasjfklhsljkajkfjk dfjasklfjsa;jfkc asljfak;slfjkaaaaa sofjsakfkaldjfkl;fs',
    deadline: '01/10/2023',
    status: 'notstarted',
    attachment: '',
    attachment_name: '',
    weighting: 5,
    priority: 'low',
    busyness: 16,
    date_edited: '19/09/2023 at 9:00pm',
    editor: 'Philip Tran'
  },
  {
    id: 1,
    project: 1,
    name: 'Task 1',
    description: 'Yes',
    deadline: '30/09/2023',
    status: 'notstarted',
    attachment: '',
    attachment_name: '',
    weighting: 4,
    priority: 'high',
    busyness: 16,
    date_edited: '20/09/2023 at 9:00pm',
    editor: 'Alex Xu'
  },
  {
    id: 1,
    project: 1,
    name: 'Task 1',
    description: 'Yes',
    deadline: 'Invalid Date',
    status: 'notstarted',
    attachment: '',
    attachment_name: '',
    weighting: 5,
    priority: 'low',
    busyness: 16,
    date_edited: '22/09/2023 at 9:00pm',
    editor: 'Philip Tran'
  },
  {
    id: 1,
    project: 1,
    name: 'Task 1',
    description: '',
    deadline: 'Invalid Date',
    status: 'notstarted',
    attachment: '',
    attachment_name: '',
    weighting: 5,
    priority: 'low',
    busyness: 16,
    date_edited: '24/09/2023 at 9:00pm',
    editor: 'Philip Tran'
  },
  {
    id: 1,
    project: 1,
    name: 'Task 99',
    description: 'Yes yayyy',
    deadline: '02/10/2023',
    status: 'inprogress',
    attachment: '',
    attachment_name: '',
    weighting: 5,
    priority: 'medium',
    busyness: 16,
    date_edited: '19/09/2023 at 9:00pm',
    editor: 'Philip Tran'
  },
]

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 350,
    height: 450,
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '0 0 4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

export default function TaskHistoryBtn() {

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    //event.stopPropagation();
    if (open) {
      handleClose();
      setSelectedHistory([]);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [history, setHistory] = useState([]);
  const [editMap, setEditMap] = useState({});
  const [selectedHistory, setSelectedHistory] = useState([]);
  const { isModalShown, toggleModal } = useModal();
  const [showComparison, setShowComparison] = useState(false);
  const toggleComparisonModal = () => {
    setShowComparison(!showComparison);
  }

  const fetchHistoryAndRender = () => {
    // try {
    //   await fetchAPIRequest('/notifications/all', 'GET').then((response) => {
    //     // Render all fetched notifications
    //     const toRender = [];
    //     response.forEach((notif, index) => {
    //       toRender.push(
    //         <MenuItem sx={{ paddingRight: 0 }}>
    //           <NotificationItem
    //             key={index}
    //             handle={notif.sender}
    //             action={notif.message}
    //             time={notif.timestamp}
    //             notificationId={notif.id}
    //             type={notif.type}
    //             projectId={notif.project}
    //             renderNotif={fetchNotificationsAndRender}
    //             status={notif.status}
    //           />
    //         </MenuItem>
    //       );
    //       toRender.push(<Divider sx={{ my: 0.5 }} />);
    //     });
    //     setNotifications(toRender);
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
    const toRender = [];
    const toMap = {};
    dummyHistory.forEach((edit, index) => {
      const taskBody = edit;
      taskBody.editNumber = index;
      if (index === 0) {
        taskBody.editName = "Original Version";
      } else {
        taskBody.editName = `Edit #${index}`
      }
      toMap[index] = taskBody;
      toRender.push(taskBody);
    });
    toRender.reverse();
    setHistory(toRender);
    setEditMap(toMap);
  };

  useEffect(() => {
    console.log(selectedHistory)
    console.log(selectedHistory.includes(0))
  }, [anchorEl, selectedHistory])

  return (
    <>
      {selectedHistory.length === 1 && (
        <Modal
          isModalShown={isModalShown}
          toggleModal={toggleModal}
          modalTitle={
            `${editMap[selectedHistory[0]].editName} - ${editMap[selectedHistory[0]].date_edited}`
          }
        >
          <TaskInfoList
            toggleModal={toggleModal}
            purpose='history'
            taskData={editMap[selectedHistory[0]]}
          />    
        </Modal>
      )}
      {selectedHistory.length === 2 && (
        <Modal
          isModalShown={showComparison}
          toggleModal={toggleComparisonModal}
          modalTitle={'Compare Edits'}
          size={'lg'}
        >
          <Box sx={{ display: 'flex' }}>
            <Box sx={{ width: '50%' }}>
              <TaskInfoList
                toggleModal={toggleComparisonModal}
                purpose='compare'
                taskData={editMap[selectedHistory[0]]}
              />  
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 3 }}/>

            <Box sx={{ width: '50%' }}>
              <TaskInfoList
                toggleModal={toggleComparisonModal}
                purpose='compare'
                taskData={editMap[selectedHistory[1]]}
                compTaskData={editMap[selectedHistory[0]]}
              />  
            </Box>

          </Box>
          <Divider sx={{ my: 3 }} />
          <Button
            color="primary"
            fullWidth
            variant="outlined"
            onClick={toggleComparisonModal}
            margin="dense"
            sx={{ ml: 1, borderRadius: '10px' }}
          >
            Close
          </Button>  
        </Modal>
      )}

      <IconButton size="small" 
        onClick={handleClick}
        overlap="circular"
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}    
      >

        <HistoryIcon color="default" onClick={fetchHistoryAndRender}/>

        <StyledMenu
          MenuListProps={{
            'aria-labelledby': 'demo-customized-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column', 
              position: 'sticky',
              top: 0,
              zIndex: 2,
              backgroundColor: 'white',
              pt: '4px',
              boxShadow: '0 0 5px 0',
              mb: 1
            }}
            onClick={(e) => e.stopPropagation()} 
          >  
            <Box sx={{ display: 'flex', mb: 0.5 }} >
              <Typography
                variant="h5"
                sx={{ mb: 1, fontWeight: 'medium', px: 2, paddingTop: 1 }}
              >
                Task History
              </Typography>
              <Button
                onClick={
                  selectedHistory.length === 1 ?
                    toggleModal : toggleComparisonModal
                }
                sx={{
                  marginLeft: 'auto',
                  my: 'auto',
                  borderRadius: '10px',
                  color: '#8378e3',
                  height: 1,
                  '&:hover': {
                    backgroundColor: '#cdc9f4',
                  },
                  marginRight: 2,
                }}
                disabled={selectedHistory.length === 0 ? true : false}
              >
                {selectedHistory.length === 2 ?
                  'Compare edits' : 'View details'}
              </Button>
            </Box>  

            {selectedHistory.length > 0 && (
              <Divider />
            )}
            
            {selectedHistory.length === 1 && (
              <Box>
                <Typography
                  sx={{ px: 2, py: 1 }}
                >
                  {`Compare ${editMap[selectedHistory[0]].editName} ${'\u2794'}`}
                </Typography>
              </Box>
            )}
            {selectedHistory.length === 2 && (
              <Box>
                <Typography
                  sx={{ px: 2, py: 1 }}
                >
                  {
                    `Compare ${editMap[selectedHistory[0]].editName} ${'\u2794'} 
                    ${editMap[selectedHistory[1]].editName}`
                  }
                </Typography>
              </Box>
            )}
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {history.map((task, index) => (
              <>
                <MenuItem
                  onClick={(event) => {
                    selectedHistory.includes(task.editNumber) ?
                      setSelectedHistory((hist) =>  hist.filter((edNum) => edNum !== task.editNumber)) : 
                      setSelectedHistory((hist) => [...hist, task.editNumber])
                    event.stopPropagation();
                  }}
                  disabled={ selectedHistory.length === 2 && 
                    !selectedHistory.includes(task.editNumber) ? true : false }
                  sx={{ p: 0, zIndex: 1 }}
                >
                  <TaskHistoryItem
                    key={task.editNumber}
                    taskData={task}
                  />
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
              </>
            ))}
          </Box>
        </StyledMenu>
      </IconButton>
    </>
  );
}
