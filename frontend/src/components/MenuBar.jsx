import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useState, useRef, useEffect } from 'react';

// Logo
import { ReactComponent as Logo } from '../assets/logo.svg';

// Icon imports
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Other imports
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import { fetchAPIRequest } from '../helpers';

export default function MenuBar({ setIsLoggedIn }) {
  // Use navigate
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isFold, setIsFold] = useState(false);

  // Fetch user information
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchAPIRequest('/profile', 'GET');
        setUser(response);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, []);

  const iconStyle = {
    borderRadius: '10px',
    fontWeight: 'bold',
    display: 'flex',
    paddingY: '10px',
    gap: '5px',
  };

  const iconNameStyle = {
    display: {
      '@media (max-width: 1000px)': {
        display: 'none',
      },
      '@media (min-width: 1000px)': {
        display: isFold ? 'none' : 'flex',
      },
    },
    borderRadius: '10px',
    fontWeight: 'bold',
    pl: 1,
    py: '10px',
    gap: '5px',
  };

  // Menu selection styling:
  const menuStyle = {
    borderRadius: '10px',
    fontWeight: 'bold',
    display: 'flex',
    '&:hover': {
      backgroundColor: 'rgba(131, 120, 227, 0.3)',
      cursor: 'pointer',
    },
    paddingY: '10px',
    gap: '5px',
  };

  // Handle logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('notification_status');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <Grid
      item
      sx={{
        width: isFold ? '70px' : '250px',
        overflow: 'auto',
        display: {
          '@media (max-width: 1000px)': {
            width: '70px',
          },
        },
      }}
    >
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          '@media (max-width: 1000px)': {
            alignItems: 'center',
            justifyContent: 'center',
          },
          alignItems: isFold && 'center',
          justifyContent: isFold && 'center',
          overflowX: 'hidden',
        }}
      >
        <Box
          sx={{
            '@media (max-width: 1000px)': {
              opacity: 0,
              cursor: 'auto',
            },
            ml: 'auto',
            mt: 2,
            mr: 2,
            cursor: 'pointer',
          }}
          onClick={() => setIsFold((prev) => !prev)}
        >
          {isFold ? (
            <ChevronRightIcon sx={{ fontSize: 30 }} />
          ) : (
            <ChevronLeftIcon sx={{ fontSize: 30 }} />
          )}
        </Box>
        <Box
          sx={{
            mt: isFold ? 1 : -3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginX: 'auto',
            '@media (max-width: 1000px)': {
              width: '80%',
              mt: 1,
            },
            width: isFold ? '80%' : '50%',
          }}
        >
          <Logo />
        </Box>
        {/* Top Tabs */}
        <Box sx={{ px: 2 }}>
          <Box
            sx={{
              ...iconNameStyle,
              textAlign: 'left',
              ml: 1,
            }}
          >
            <Typography
              style={{
                color: '#776E6E',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              Workflow
            </Typography>
          </Box>
          <MenuItem sx={menuStyle} onClick={() => navigate('/')}>
            <HomeOutlinedIcon sx={iconStyle} />
            <Typography sx={iconNameStyle}>Dashboard</Typography>
          </MenuItem>
          <MenuItem sx={menuStyle} onClick={() => navigate('/projects')}>
            <AccountTreeOutlinedIcon sx={iconStyle} />
            <Typography sx={iconNameStyle}>Projects</Typography>
          </MenuItem>
          <MenuItem sx={menuStyle} onClick={() => navigate('/connections')}>
            <PeopleAltOutlinedIcon sx={iconStyle} />

            <Typography sx={iconNameStyle}>Connections</Typography>
          </MenuItem>
        </Box>
        {/* Separation line */}
        <Box
          sx={{
            width: '70%',
            height: '4px',
            backgroundColor: '#DEDEDE',
            align: 'center',
            margin: '0 auto',
            my: 3,
          }}
        />

        {/* Bottom tabs */}
        <Box sx={{ px: 2 }}>
          <Box
            sx={{
              ...iconNameStyle,
              textAlign: 'left',
              ml: 1,
            }}
          >
            <Typography
              style={{
                color: '#776E6E',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              Analytics
            </Typography>
          </Box>
          <MenuItem sx={menuStyle} onClick={() => navigate('/performance')}>
            <TimelineOutlinedIcon sx={iconStyle} />
            <Typography sx={iconNameStyle}>Performance</Typography>
          </MenuItem>
          <MenuItem sx={menuStyle} onClick={() => navigate('/reports')}>
            <AssessmentOutlinedIcon sx={iconStyle} />
            <Typography sx={iconNameStyle}>Reports</Typography>
          </MenuItem>
        </Box>

        {/* User profile image */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 'auto',
            marginBottom: '20px',
          }}
        >
          {/* Profile Image */}
          <Box>
            <Stack direction="row" spacing={2}>
              <Box
                ref={anchorRef}
                id="composition-button"
                aria-controls={open ? 'composition-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    overflow: 'hidden',
                    '&:hover': {
                      cursor: 'pointer',
                    },
                    '@media (max-width: 1000px)': {
                      marginX: 'auto',
                    },
                    marginX: isFold ? 'auto' : 1,
                  }}
                >
                  <img
                    alt="profile-pic"
                    src={
                      user?.image
                        ? user?.image
                        : 'https://www.gstatic.com/images/branding/product/2x/avatar_square_blue_120dp.png'
                    }
                    height={45}
                    width={45}
                    style={{ borderRadius: '50%' }}
                  />
                </Box>
                <Box
                  sx={{
                    textAlign: 'left',
                    mr: 3,
                    display: {
                      '@media (max-width: 1000px)': {
                        display: 'none',
                      },
                      display: isFold && 'none',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '16px',
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: '11px',
                    }}
                  >
                    UNSW
                  </Typography>
                </Box>
                <UnfoldMoreIcon
                  sx={{
                    display: {
                      '@media (max-width: 1000px)': {
                        display: 'none',
                      },
                      display: isFold && 'none',
                    },
                  }}
                />
                <Popper
                  open={open}
                  anchorEl={anchorRef.current}
                  role={undefined}
                  placement="bottom"
                  transition
                  disablePortal
                  sx={{ zIndex: 2 }}
                >
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      sx={{
                        transformOrigin: placement === 'left top',
                        width: '200px',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                        borderRadius: '10px',
                        marginBottom: '15px',
                        ml: isFold && 2,
                      }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList
                            id="composition-menu"
                            aria-labelledby="composition-button"
                            onKeyDown={handleListKeyDown}
                            sx={{
                              // Adjuts the inside of each profuile, my account etc
                              paddingX: '10px',
                            }}
                          >
                            <MenuItem
                              onClick={
                                (handleClose, () => navigate('/profile'))
                              }
                              sx={menuStyle}
                            >
                              <PersonOutlineOutlinedIcon />
                              <Box>View Profile</Box>
                            </MenuItem>
                            <Box
                              sx={{
                                width: '95%',
                                height: '1px',
                                backgroundColor: '#CACACA',
                                marginX: 'auto',
                                marginY: '5px',
                              }}
                            />
                            <MenuItem
                              onClick={(handleClose, logout)}
                              sx={menuStyle}
                            >
                              <LogoutOutlinedIcon />
                              <Box>Logout</Box>
                            </MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
}
