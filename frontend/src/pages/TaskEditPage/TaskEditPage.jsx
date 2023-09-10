import { Box, Typography, Grid } from '@mui/material';
import { fetchAPIRequest } from '../../helpers';
import { useState, useEffect } from 'react';
import { LoadingScreen, Editor } from '../../components';


const TaskEditPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getDashboard = async () => {
      setIsLoading(true);
      //   const taskData = await fetchAPIRequest('/', 'GET');
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
          Task Edit
        </Typography>
      </Box>
      <>
        <Editor />
      </>
    </Box>
  );
};
export default TaskEditPage;
