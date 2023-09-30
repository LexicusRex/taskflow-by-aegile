import { Box, Typography } from '@mui/material';
import { fetchAPIRequest } from '../../helpers';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingScreen, Editor } from '../../components';
import SidePanel from './SidePanel';
import TaskActionBtnGroup from './TaskActionBtnGroup';
import TaskProvider from '../../context/TaskSidePanelContext';

const TaskEditPage = () => {
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [taskContentList, setTaskContentList] = useState([]);

  useEffect(() => {
    const getDashboard = async () => {
      setIsLoading(true);
      const taskContent = await fetchAPIRequest(
        `/task/get/content?projectId=${projectId}`,
        'GET'
      );
      setTaskContentList(taskContent);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    getDashboard();
  }, []);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <TaskProvider>
      <Box sx={{ display: 'flex' }}>
        <Box
          sx={{
            py: 4,
            px: 4,
            boxSizing: 'border-box',
            height: 'fit-content',
            width: '100%',
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
          {taskContentList.map((task, index) => (
            <Box key={index} sx={{ mt: 5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
                  {task.name}
                </Typography>
                <TaskActionBtnGroup taskId={task.id} />
              </Box>
              <Editor initialBlocks={task.blocks} taskId={task.id} />
            </Box>
          ))}
        </Box>
        <SidePanel />
      </Box>
    </TaskProvider>
  );
};
export default TaskEditPage;
