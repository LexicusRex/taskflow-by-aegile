import { Box, Typography } from '@mui/material';
import MenuButton from './MenuButton';

// Three page view
import TaskDisplayScreen from './TaskDisplayScreen';
import TaskPerformanceScreen from './TaskPerformanceScreen';
import TeamDisplay from './TeamDisplay';
import TaskPageAnalytics from './TaskPageAnalytics';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAPIRequest } from '../../helpers';
import { useNavigate } from 'react-router-dom';

export default function TaskPage() {
  const [projectTab, setProjectTab] = useState('tasks');
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const getProjectInfo = async () => {
      const projectInfo = await fetchAPIRequest(
        `/project/specific?projectId=${projectId}`,
        'GET'
      );
      setProject(projectInfo.project);
      if (projectInfo.error) {
        navigate('/projects');
      }
    };
    getProjectInfo();
  }, [navigate, projectId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        width: '100%',
        height: '100vh',
        px: 4,
      }}
    >
      <Typography
        variant="h1"
        sx={{ fontSize: '30px', fontWeight: 600, mb: 3, marginTop: 6 }}
      >
        {project?.name}
      </Typography>
      {/* Top menu */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          paddingBottom: 2,
        }}
      >
        <MenuButton
          isCurrentTab={projectTab === 'tasks'}
          btnName={'Tasks'}
          handleClick={setProjectTab}
        />
        <MenuButton
          isCurrentTab={projectTab === 'team'}
          btnName={'Team'}
          handleClick={setProjectTab}
        />
        <MenuButton
          isCurrentTab={projectTab === 'performance'}
          btnName={'Performance'}
          handleClick={setProjectTab}
        />
      </Box>
      {/* Task display screen */}
      {projectTab === 'tasks' && (
        <TaskDisplayScreen isEdit={isEdit} setIsEdit={setIsEdit} />
      )}
      {projectTab !== 'tasks' && (
        <Box
          sx={{
            display: 'flex',
            height: '100vh',
            '@media (max-width: 1400px)': {
              flexDirection: 'column',
            },
          }}
        >
          {projectTab === 'team' && <TeamDisplay />}
          {projectTab === 'performance' && <TaskPerformanceScreen />}
          {/* <TaskDetails taskName={'Hello'} taskId={selectedTask} /> */}
          <TaskPageAnalytics
            isEdit={isEdit}
            projectId={projectId}
            style={{
              width: '20%',
            }}
          />
        </Box>
      )}
    </Box>
  );
}
