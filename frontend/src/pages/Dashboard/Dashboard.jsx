import { Box, Typography, Grid } from '@mui/material';
import { fetchAPIRequest } from '../../helpers';
import { useState, useEffect } from 'react';
import ConnectionsPanel from './ConnectionsPanel';
import OverviewPanel from './OverviewPanel';
import TaskChart from './TaskChart';
import PendingTaskList from './PendingTaskList';
import { LoadingScreen } from '../../components';

const Dashboard = () => {
  const [dashConnections, setDashConnections] = useState([]);
  const [dashTasks, setDashTasks] = useState([]);
  const [dashChart, setDashChart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getDashboard = async () => {
      setIsLoading(true);
      const dashboard = await fetchAPIRequest('/dashboard', 'GET');
      setDashConnections(dashboard.connections);
      setDashTasks(dashboard.tasks);
      setDashChart(dashboard.chart);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    getDashboard();
  }, []);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Box
      sx={{
        py: 4,
        px: 4,
        boxSizing: 'border-box',
        height: 'fit-content',
      }}
    >
      <Box
        sx={{
          textAlign: 'left',
          py: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{ fontSize: '30px', fontWeight: 600, mb: 3 }}
        >
          Dashboard
        </Typography>
      </Box>
      <Grid
        container
        columnSpacing={2}
        rowSpacing={5}
        columns={12}
        sx={{ gridAutoFlow: 'column' }}
      >
        <Grid item xs={12} sm={12} md={12} lg={8} xl={8}>
          <OverviewPanel isLoading={isLoading} />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={4} xl={4}>
          <TaskChart isLoading={isLoading} chartData={dashChart} />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={4} xl={4}>
          <ConnectionsPanel
            connectionsData={dashConnections}
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={8} xl={8}>
          <PendingTaskList tasksData={dashTasks} isLoading={isLoading} />
        </Grid>
      </Grid>
    </Box>
  );
};
export default Dashboard;
