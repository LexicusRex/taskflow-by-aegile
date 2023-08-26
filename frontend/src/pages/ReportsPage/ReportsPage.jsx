import { Box, Typography, Grid, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchAPIRequest } from '../../helpers';
import { LoadingScreen } from '../../components';
import ExpandBox from './ExpandBox';
import UserAccordion from './UserAccordion';
import { CircularProgress } from '@mui/material';

// Expand Box
const ReportsPage = () => {
  const [projectList, setProjectList] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [btnLock, setBtnLock] = useState(false);
  const [userReports, setUserReports] = useState([]);

  useEffect(() => {
    // Fetch project json (everything), then inject respective data into each box
    const getProjectsAndRender = async () => {
      const tmpList = [];
      try {
        await fetchAPIRequest('/feedback/reports', 'GET').then(
          async (response) => {
            try {
              const project = await fetchAPIRequest('/project', 'GET');
              console.log(project)
              for (const [key, value] of Object.entries(project['projects'])) {
                tmpList.push(
                  <ExpandBox
                    key={key}
                    projectData={value}
                    reportData={response['projects'][value.id]}
                    setIsEdit={setIsEdit}
                  />
                );
                setUserReports(response['user']);
              }
              setProjectList(tmpList);
            } catch (err) {
              console.log(err);
            }
          }
        );
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    getProjectsAndRender();
  }, [isEdit]);
  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        height: '98vh',
        py: 6,
        px: 4,
      }}
    >
      <Typography
        variant="h1"
        sx={{ fontSize: '30px', fontWeight: 600, mb: 3 }}
      >
        Feedback Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Report are based on the last 7 days worth of metrics. Report generation
        takes around 30 seconds.
      </Typography>
      <Grid
        container
        columns={12}
        spacing={2}
        sx={{
          flexGrow: 1,
        }}
      >
        <Grid item xs={12} sm={12} md={12} lg={12} xl={8}>
          <Typography variant="h6" sx={{ fontSize: '24px', mb: 1 }}>
            Project Reports
          </Typography>
          {projectList}
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          lg={12}
          xl={4}
          sx={{
            px: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h1" sx={{ fontSize: '24px', mb: 1 }}>
              User Reports
            </Typography>
            <Button
              onClick={async () => {
                setBtnLock(true);
                try {
                  await fetchAPIRequest('/feedback/user', 'POST', {}).then(
                    () => {
                      setIsEdit((prev) => !prev);
                    }
                  );
                } catch (error) {
                  console.log(error);
                } finally {
                  setBtnLock(false);
                }
              }}
              sx={{ marginLeft: 'auto', my: 'auto', borderRadius: '10px' }}
            >
              {btnLock ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
          </Box>
          <Box
            sx={{
              borderRadius: '20px 20px 0 0',
              boxShadow: 3,
              backgroundColor: '#EAEAEAAA',
              px: 2,
              py: 3,
              flexGrow: 1,
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {userReports.length === 0 ? (
              <Typography variant="h6" color="text.secondary">
                No Reports... Generate a new one!
              </Typography>
            ) : (
              userReports.toReversed().map((data, index) => {
                return (
                  <UserAccordion
                    key={`USER${index}`}
                    reportData={data}
                    index={index}
                  />
                );
              })
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
export default ReportsPage;
