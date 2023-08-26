import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import InviteCard from './InviteCard';
import { fetchAPIRequest } from '../../helpers';

// Icons
import { LoadingScreen } from '../../components';

export default function ProjectInvitesPage() {
  // Project card array
  const [myInvites, setMyInvites] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchInvites = async () => {
      try {
        const invites = await fetchAPIRequest('/project/invite', 'GET');
        setMyInvites(invites);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchInvites();
  }, [isEdit]);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        px: 4,
        gap: 3,
      }}
    >
      {myInvites?.accept?.map((invite, index) => (
        <InviteCard
          key={'accept' + index}
          {...invite}
          status="Accept"
          setIsEdit={setIsEdit}
        />
      ))}
      {myInvites?.pending?.map((invite, index) => (
        <InviteCard
          key={'pending' + index}
          {...invite}
          status="Pending"
          setIsEdit={setIsEdit}
        />
      ))}
      {myInvites?.pending?.length + myInvites?.accept?.length <= 0 && (
        <Typography variant="h6" color="text.secondary" sx={{ ml: 2, flex: 1 }}>
          No project invites yet...
        </Typography>
      )}
    </Box>
  );
}
