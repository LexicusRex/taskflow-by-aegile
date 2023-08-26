import { Badge, Box, Skeleton, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { fetchAPIRequest } from '../helpers';
import ReactTimeAgo from 'react-time-ago';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

// Notification icons
import GroupIcon from '@mui/icons-material/Group';
import TaskIcon from '@mui/icons-material/Task';
import CommentIcon from '@mui/icons-material/Comment';
import ProjectIcon from '@mui/icons-material/AccountTreeOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { useNavigate } from 'react-router-dom';

export default function NotificationItem({
  handle,
  action,
  time,
  notificationId,
  renderNotif,
  type,
  projectId,
  status,
}) {
  // Declare navigation
  const navigate = useNavigate();
  // Icon colour map and margin map
  const iconColour = {
    task: '#faa61a',
    connection: '#36b3fb',
    comment: '#64db82',
    project: '#8378e3',
    achievement: '#ff7f50',
  };

  const iconStyle = {
    color: 'white',
    height: '15px',
    width: '15px',
  };

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      top: 42,
      right: 5,
      border: `2px solid ${theme.palette.background.paper}`,
      width: '25px',
      height: '25px',
      display: 'flex',
      borderRadius: '50%',
      justifyContent: 'center',
      alignItems: 'center',
      mx: 'auto',
      backgroundColor: `${iconColour[type]}`,
    },
  }));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const deleteNotification = async () => {
    try {
      await fetchAPIRequest(
        `/notifications/delete?notificationId=${notificationId}`,
        'DELETE'
      );
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch the user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const user = await fetchAPIRequest(`/user?handle=${handle}`, 'GET');
        setUser(user);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, [handle]);

  return (
    <Box
      onClick={() => {
        switch (type) {
          case 'task':
            navigate(`/projects/${projectId}`);
            break;
          case 'comment':
            navigate(`/projects/${projectId}`);
            break;
          case 'project':
            if (status !== 'delete') {
              navigate(`/projects`, {
                state: { projectInvite: true },
              });
            }
            break;
          case 'achievement':
            navigate(`/profile`);
            break;
          default:
            navigate(`/connections`);
            break;
        }
        deleteNotification();
      }}
      sx={{ display: 'flex', minHeight: '60px' }}
      maxWidth={false}
    >
      <Box>
        <StyledBadge
          badgeContent={(() => {
            switch (type) {
              case 'task':
                return (
                  <TaskIcon
                    color='default'
                    sx={{ ml: 1.55 }}
                    style={iconStyle}
                  />
                );
              case 'comment':
                return (
                  <CommentIcon
                    color='default'
                    sx={{ ml: 1.55 }}
                    style={iconStyle}
                  />
                );
              case 'achievement':
                return (
                  <EmojiEventsIcon
                    color='default'
                    sx={{ ml: 1.55 }}
                    style={iconStyle}
                  />
                );
              case 'project':
                return (
                  <ProjectIcon
                    color='default'
                    sx={{ ml: 1.55 }}
                    style={iconStyle}
                  />
                );
              default:
                return (
                  <GroupIcon
                    color='default'
                    sx={{ ml: 1.55 }}
                    style={iconStyle}
                  />
                );
            }
          })()}
          color='default'
        >
          {isLoading && (
            <Skeleton
              variant='circular'
              width={50}
              height={50}
              sx={{ mr: '-50px' }}
            />
          )}
          <img
            width={50}
            height={50}
            style={{ borderRadius: '50%' }}
            src={user?.image}
            alt='profile_image'
            onLoad={() => setIsLoading(false)}
          />
        </StyledBadge>
      </Box>
      <Box
        sx={{
          ml: '10px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Name and time */}
        <Box sx={{ display: 'flex', width: '230px' }}>
          {isLoading ? (
            <Skeleton variant='rounded' width='100%' height={25} />
          ) : (
            <Typography sx={{ font: '10px', fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
          )}
        </Box>
        <Box sx={{ width: '280px', display: 'flex' }}>
          {isLoading ? (
            <Skeleton
              variant='rounded'
              width='100%'
              height={25}
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#414141',
                whiteSpace: 'normal',
              }}
            >
              @{handle} {action}.
            </Typography>
          )}
          <CloseIcon
            onClick={(e) => {
              deleteNotification().then(() => {
                renderNotif();
              });
              e.stopPropagation();
            }}
            sx={{
              marginLeft: 'auto',
              p: '5px',
              '&:hover': {
                cursor: 'pointer',
                backgroundColor: '#cdc9f4',
                borderRadius: '50%',
              },
            }}
          />
        </Box>
        {isLoading ? (
          <Skeleton variant='rounded' width='25%' height={15} sx={{ mt: 1 }} />
        ) : (
          <Typography
            variant='6'
            sx={{
              fontSize: '10px',
              fontWeight: 600,
              color: '#776E6E',
            }}
          >
            <ReactTimeAgo date={new Date(time * 1000)} locale='en-US' />
          </Typography>
        )}
      </Box>
    </Box>
  );
}
