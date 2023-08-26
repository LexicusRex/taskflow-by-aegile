import { Box, Typography } from '@mui/material';
import OverviewStatus from './OverviewStatus';
import { fetchAPIRequest } from '../../helpers';
import { useEffect, useState } from 'react';

const OverviewPanel = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const getAnalytics = async () => {
      const analytics = await fetchAPIRequest('/dashboard/overview', 'GET');
      setAnalytics(analytics);
    };
    getAnalytics();
  }, []);

  return (
    <Box
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        height: '100%',
        boxSizing: 'border-box',
        py: 2,
        px: 4,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Overview
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 3,
        }}
      >
        <OverviewStatus value={analytics?.tasks} type="Tasks" change={0} />
        <OverviewStatus
          value={analytics?.projects}
          type="Projects"
          change={75}
        />
        <OverviewStatus
          value={analytics?.connections}
          type="Connections"
          change={-5}
        />
      </Box>
    </Box>
  );
};
export default OverviewPanel;
