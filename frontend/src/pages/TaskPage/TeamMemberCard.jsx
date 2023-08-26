import { Box, IconButton, Typography, MenuItem } from '@mui/material';
import Select from '@mui/material/Select';
import ClearIcon from '@mui/icons-material/Clear';
import DoneIcon from '@mui/icons-material/Done';
import { fetchAPIRequest } from '../../helpers';
import { useContext, useState } from 'react';
import { AlertContext } from '../../context/AlertContext';
import React from 'react';

const TeamMemberCard = ({
  name,
  handle,
  image,
  role,
  projectId,
  setIsEdit,
  profileRole,
}) => {
  const [isFetchSuccess, setIsFetchSuccess] = useState(false);
  const alertCtx = useContext(AlertContext);
  const [userRole, setUserRole] = useState(role);

  const handleChange = (event) => {
    setUserRole(event.target.value);
  };

  const removeMember = async () => {
    try {
      await fetchAPIRequest('/project/leave', 'DELETE', {
        projectId: projectId,
        handle: handle,
      });

      setIsFetchSuccess(true);
      setTimeout(() => {
        setIsEdit((prevState) => !prevState);
      }, 1000);
    } catch (err) {
      alertCtx.error(err.message);
    }
  };

  const changePermissions = async () => {
    try {
      await fetchAPIRequest('/project/permissions', 'PUT', {
        projectId: projectId,
        handle: handle,
      });

      setTimeout(() => {
        setIsEdit((prevState) => !prevState);
      }, 1000);
    } catch (err) {
      alertCtx.error(err.message);
    }
  };

  return (
    <Box
      sx={{
        height: 70,
        display: 'flex',
        flexGrow: 1,
        width: '100%',
        bgcolor: 'white',
        borderRadius: 3,
        boxShadow: 3,
        alignItems: 'center',
        boxSizing: 'border-box',
        px: 6,
        justifyContent: 'stretch',
        alignSelf: 'flex-start',
      }}
    >
      <Box
        component="img"
        src={image ? image : 'https://unsplash.it/50/50'}
        alt="profile image"
        sx={{
          borderRadius: '50%',
          width: 50,
          height: 50,
          mr: 3,
          display: { xs: 'none', sm: 'none', md: 'block' },
        }}
      />
      <Typography
        variant="h6"
        sx={{
          width: '37%',
          fontSize: { xs: 16, lg: 20 },
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          px: 1,
        }}
      >
        {name}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          width: '43%',
          fontSize: { xs: 16, lg: 20 },
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          px: 8,
        }}
      >
        <Select
          value={userRole}
          onChange={(e) => {
            changePermissions();
            handleChange(e);
          }}
          disabled={profileRole !== 'creator'}
        >
          {role === 'creator' && <MenuItem value={'creator'}>Creator</MenuItem>}
          {role !== 'creator' && <MenuItem value={'admin'}>Admin</MenuItem>}
          {role !== 'creator' && <MenuItem value={'member'}>Member</MenuItem>}
        </Select>
      </Typography>
      <IconButton sx={{ ml: 'auto' }} onClick={removeMember}>
        {isFetchSuccess ? <DoneIcon /> : <ClearIcon />}
      </IconButton>
    </Box>
  );
};
export default TeamMemberCard;
