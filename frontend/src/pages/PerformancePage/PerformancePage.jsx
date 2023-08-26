import { Box, Typography, Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { LoadingScreen } from '../../components';
import PerformanceLineChart from './PerformanceLineChart';
import PerformanceDonutChart from './PerformanceDonutChart';
import { fetchAPIRequest } from '../../helpers';

const PerformancePage = () => {
  const [taskCompletions, setTaskCompletions] = useState([]);
  const [projectContributions, setProjectContributions] = useState({});
  const [userBusyness, setUserBusyness] = useState([]);
  const [totalTaskCompletions, setTotalTaskCompletions] = useState([]);
  const [avgTimeTillDue, setAvgTimeTillDue] = useState([]);
  const [avgCompletionDuration, setAvgCompletionDuration] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getDashboard = async () => {
      setIsLoading(true);
      const performanceStats = await fetchAPIRequest(
        '/analytics/performance',
        'GET'
      );
      setProjectContributions(performanceStats.projectContributions);
      setTaskCompletions(performanceStats.taskCompletions);
      setTotalTaskCompletions(performanceStats.totalTaskCompletions);
      setUserBusyness(performanceStats.dailyBusyness);
      setAvgTimeTillDue(performanceStats.avgTimeTillDue);
      setAvgCompletionDuration(performanceStats.avgCompletionDuration);

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
          Performance Analytics
        </Typography>
      </Box>
      <Grid
        container
        columnSpacing={2}
        rowSpacing={5}
        columns={12}
        sx={{ gridAutoFlow: 'column' }}
      >
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <PerformanceLineChart
            chartTitle="Task Completion"
            labelTitle="Daily Tasks Completed"
            chartData={taskCompletions}
            additionalData={totalTaskCompletions}
            additionalSelectTitle="Total Tasks Completed since Week Start"
            yAxisLabel="Tasks Completed"
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
          <PerformanceDonutChart
            chartTitle="Project Contribution"
            labelTitle="Task Contribution"
            selectionTitle="Project"
            chartData={projectContributions}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={8} xl={8}>
          <PerformanceLineChart
            chartTitle="Daily Busyness"
            labelTitle="Busyness"
            chartData={userBusyness}
            mainColor="rgb(124, 165, 228)"
            mainShade="rgba(124, 165, 228, 0.3)"
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
          <PerformanceLineChart
            chartTitle="Average Hours Remaining at Task Completion"
            labelTitle="Avg. Hours Left"
            chartData={avgTimeTillDue}
            chartPrecision={2}
            yAxisLabel="Hours"
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
          <PerformanceLineChart
            chartTitle="Average Task Duration"
            labelTitle="Avg. Hours Spent"
            chartData={avgCompletionDuration}
            mainColor="rgb(124, 165, 228)"
            mainShade="rgba(124, 165, 228, 0.3)"
            chartPrecision={2}
            yAxisLabel="Hours"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
export default PerformancePage;
