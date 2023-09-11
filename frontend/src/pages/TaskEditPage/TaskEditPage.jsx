import { Box, Typography, Grid } from '@mui/material';
import { fetchAPIRequest } from '../../helpers';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingScreen, Editor } from '../../components';

const TaskEditPage = () => {
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [taskList, setTaskList] = useState([]);
  useEffect(() => {
    const getDashboard = async () => {
      setIsLoading(true);
      const taskData = await fetchAPIRequest(
        `/task/get/content?projectId=${projectId}`,
        'GET'
      );
      setTaskList(taskData);
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
      {taskList.map((task, index) => (
        <Box key={index} sx={{ mt: 5 }}>
          <Typography sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
            {task.name}
          </Typography>
          <Editor initialBlocks={task.blocks} taskId={task.id} />
        </Box>
      ))}
    </Box>
  );
};
export default TaskEditPage;
