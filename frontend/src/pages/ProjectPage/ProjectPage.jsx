import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import NewProjectButton from './NewProjectButton';
import ProjectDisplayScreen from './ProjectDisplayScreen';
import ProjectInvitesPage from './ProjectInvitesPage';

// Icons
import TuneIcon from '@mui/icons-material/Tune';
import MenuButton from '../TaskPage/MenuButton';
import { useLocation } from 'react-router-dom';

export default function ProjectPage() {
  // Select views for project page
  const [projectTab, setProjectTab] = useState('project overview');
  const [isEdit, setIsEdit] = useState(false);
  const location = useLocation();
  useEffect(() => {
    if (location?.state?.projectInvite === true) {
      setProjectTab('project invites');
    }
  }, [location]);

  return (
    <Box
      sx={{
        py: 4,
        boxSizing: 'border-box',
        height: '100%',
      }}
    >
      <Box
        sx={{
          textAlign: 'left',
          py: 2,
          px: 4,
          mb: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{ fontSize: '30px', fontWeight: 600, mb: 3 }}
        >
          My Projects
        </Typography>

        {/* Add project button and sub-title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <MenuButton
              isCurrentTab={projectTab === 'project overview'}
              btnName={'Project Overview'}
              handleClick={setProjectTab}
            />
            <MenuButton
              isCurrentTab={projectTab === 'project invites'}
              btnName={'Project Invites'}
              handleClick={setProjectTab}
            />
          </Box>
          <Box
            sx={{
              gap: 3,
              marginLeft: 'auto',
            }}
          >
            <NewProjectButton setIsEdit={setIsEdit} />
          </Box>
          <TuneIcon sx={{ fontSize: '30px', color: '#BFBFBF', ml: 4 }} />
        </Box>
      </Box>

      {projectTab === 'project overview' && (
        <ProjectDisplayScreen refetchProjects={isEdit} />
      )}
      {projectTab === 'project invites' && <ProjectInvitesPage />}
    </Box>
  );
}
