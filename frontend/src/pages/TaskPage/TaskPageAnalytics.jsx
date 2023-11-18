import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { fetchAPIRequest } from '../../helpers';
import ContributionDonut from '../ProjectPage/ContributionDonut';

export default function TaskPageAnalytics({ projectId, isEdit }) {
  const [total, setTotal] = useState(null);
  const [complete, setComplete] = useState(null);
  const [inProgress, setInProgress] = useState(null);
  const [notStarted, setNotStarted] = useState(null);
  const [contribution, setContribution] = useState(null);

  useEffect(() => {
    const getTasks = async () => {
      let total = 0;
      let complete = 0;
      let inProgress = 0;
      let notStarted = 0;
      let contribute = 0;

      // Grab user handle
      const user = await fetchAPIRequest(`/profile`, 'GET');
      const tasks = await fetchAPIRequest(
        `/task/get/all?projectId=${projectId}`,
        'GET'
      );
      for (const task of tasks) {
        total++;
        if (task.status === 'notstarted') {
          notStarted++;
        } else if (task.status === 'inprogress') {
          inProgress++;
        } else if (task.status === 'completed') {
          complete++;
        }

        if (task.assignees.includes(user.handle)) {
          contribute++;
        }
      }
      setTotal(total);
      setComplete(complete);
      setInProgress(inProgress);
      setNotStarted(notStarted);
      setContribution(contribute);
    };
    getTasks();
  }, [isEdit, projectId]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        flex: 2,
        px: 2,
        paddingTop: 2,
        minWidth: '250px',
        maxWidth: '320px',
        ml: 2,
      }}
    >
      <Typography
        variant="h1"
        sx={{ fontSize: '26px', fontWeight: 600, mb: 6 }}
      >
        Project Overview
      </Typography>
      {/* Analytics */}
      <Box sx={{ px: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography sx={{ color: '#776E6E' }}>Total Tasks:</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                sx={{
                  height: 30,
                  width: 3,
                  my: 'auto',
                  backgroundColor: '#F06680',
                }}
              ></Box>
              <Typography sx={{ fontSize: '30px', fontWeight: 'medium' }}>
                {total}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography sx={{ color: '#776E6E' }}>Complete:</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                sx={{
                  height: 30,
                  width: 3,
                  my: 'auto',
                  backgroundColor: '#9747FF',
                }}
              ></Box>
              <Typography sx={{ fontSize: '30px', fontWeight: 'medium' }}>
                {complete}
              </Typography>
            </Box>
          </Grid>
          <Grid item sx={{ mt: 6 }} xs={6}>
            <Typography sx={{ color: '#776E6E' }}>In Progress:</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                sx={{
                  height: 30,
                  width: 3,
                  my: 'auto',
                  backgroundColor: '#63B9BF',
                }}
              ></Box>
              <Typography sx={{ fontSize: '30px', fontWeight: 'medium' }}>
                {inProgress}
              </Typography>
            </Box>
          </Grid>
          <Grid item sx={{ mt: 6 }} xs={6}>
            <Typography sx={{ color: '#776E6E' }}>Not Started:</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                sx={{
                  height: 30,
                  width: 3,
                  my: 'auto',
                  backgroundColor: '#0094FF',
                }}
              ></Box>
              <Typography sx={{ fontSize: '30px', fontWeight: 'medium' }}>
                {notStarted}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {/* Separating line */}
      <Box
        sx={{
          width: '95%',
          height: 2,
          backgroundColor: '#DEDEDE',
          mx: 'auto',
          mt: 7,
          mb: 4,
        }}
      ></Box>
      <Typography
        variant="h1"
        sx={{ fontSize: '24px', fontWeight: 500, mb: 3 }}
      >
        Your Contribution
      </Typography>
      <ContributionDonut
        chartTitle={'HELLO'}
        selectionTitle={'HELLO'}
        labelTitle={'HELLO'}
        chartData={{
          Tasks: [
            {
              label: 'Your Contribution',
              data: contribution,
            },
            { label: 'Other Group Members', data: `${total - contribution}` },
          ],
        }}
      />
    </Box>
  );
}
