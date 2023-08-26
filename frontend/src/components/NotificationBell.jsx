import React, { useState } from 'react';
import { Box, Badge, Typography } from '@mui/material';

// Drop down imports
import { styled, alpha } from '@mui/material/styles';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { fetchAPIRequest } from '../helpers';
import NotificationItem from './NotificationItem';

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
    height: 400,
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
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

export default function NotificationBell({
  notificationStatus,
  setNotificationStatus,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    //event.stopPropagation();
    if (open) {
      handleClose();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Render notifications
  const [notifications, setNotifications] = useState([]);

  const fetchNotificationsAndRender = async () => {
    try {
      await fetchAPIRequest('/notifications/all', 'GET').then((response) => {
        // Render all fetched notifications
        const toRender = [];
        response.forEach((notif, index) => {
          toRender.push(
            <MenuItem sx={{ paddingRight: 0 }}>
              <NotificationItem
                key={index}
                handle={notif.sender}
                action={notif.message}
                time={notif.timestamp}
                notificationId={notif.id}
                type={notif.type}
                projectId={notif.project}
                renderNotif={fetchNotificationsAndRender}
                status={notif.status}
              />
            </MenuItem>
          );
          toRender.push(<Divider sx={{ my: 0.5 }} />);
        });
        setNotifications(toRender);
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box
      onClick={() => {
        fetchNotificationsAndRender();
        // Set notification status back to default
        localStorage.setItem('notification_status', 'default');
        setNotificationStatus('default');
      }}
      // error when there is notification
      color="default"
      overlap="circular"
      // disableElevation
      // endIcon={<KeyboardArrowDownIcon />}
      aria-controls={open ? 'demo-customized-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
    >
      <Badge
        sx={{
          float: 'right',
          mb: -10,
          mt: 4,
          mr: 3,
        }}
        // error when there is notification
        color={notificationStatus}
        overlap="circular"
        badgeContent=" "
        // disableElevation
        onClick={handleClick}
        // endIcon={<KeyboardArrowDownIcon />}
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Box
          sx={{
            width: '50px',
            height: '50px',
            backgroundColor: '#c5b7ff',
            display: 'flex',
            borderRadius: '50%',
            '&:hover': {
              cursor: 'pointer',
            },
          }}
        >
          <Box
            sx={{
              margin: 'auto',
            }}
          >
            <NotificationsNoneOutlinedIcon fontSize="medium" />
          </Box>
        </Box>
        <StyledMenu
          MenuListProps={{
            'aria-labelledby': 'demo-customized-button',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <Box sx={{ display: 'flex' }}>
            <Typography
              variant="h5"
              sx={{ mb: 1, fontWeight: 'medium', px: 2, paddingTop: 1 }}
            >
              Notifications
            </Typography>
            <Button
              onClick={async (e) => {
                e.stopPropagation();
                try {
                  await fetchAPIRequest(`/notifications/all/delete`, 'DELETE');
                } catch (err) {
                  console.log(err);
                }
                fetchNotificationsAndRender();
              }}
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
            >
              Clear All
            </Button>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.length === 0 ? (
              <Box
                sx={{
                  margin: 'auto',
                  marginTop: '70px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <NotificationsNoneOutlinedIcon
                  sx={{ fontSize: '90px', marginX: 'auto' }}
                />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontSize: '18px' }}
                >
                  Notifications all clear!
                </Typography>
              </Box>
            ) : (
              notifications
            )}
          </Box>
        </StyledMenu>
      </Badge>
    </Box>
  );
}
