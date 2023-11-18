import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { fetchAPIRequest } from '../../helpers';
import { useState, useEffect } from 'react';
import { Editor, LoadingScreen } from '../../components';

const mergeBlocks = (taskContentList) => {
  const mergedBlocks = [];
  for (let task of taskContentList) {
    mergedBlocks.push(...task.blocks);
  }
  return mergedBlocks;
};

const DocumentPreviewPage = () => {
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
    <Box sx={{ display: 'flex', width: '100%' }}>
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
            Document Preview
          </Typography>
        </Box>
        <Box
          sx={{
            px: '20rem',
            boxSizing: 'border-box',
            height: 'fit-content',
            width: '100%',
          }}
        >
          <Editor
            initialBlocks={mergeBlocks(taskContentList)}
            taskId={-1}
            canEdit={false}
          />
        </Box>
      </Box>
    </Box>
  );
};
export default DocumentPreviewPage;
