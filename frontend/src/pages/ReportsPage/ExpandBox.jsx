import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Typography, Grid, Button, Divider } from '@mui/material';
import Accordion from './Accordion';
import { fetchAPIRequest } from '../../helpers';
import { CircularProgress } from '@mui/material';

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function ExpandBox({ projectData, reportData, setIsEdit }) {
  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const [loading, setLoading] = useState(false);

  const getStatusColour = () => {
    // Check for deadline against current date
    console.log(projectData.endDate)
    const breakDown = projectData.end_date.split('/');
    const dueDate = new Date(breakDown[2], breakDown[1] - 1, breakDown[0]);
    const today = new Date();
    const isOverdue = dueDate.getTime() < today.getTime();
    if (isOverdue) {
      return ['Overdue', '#F64E43'];
    } else if (projectData.progress === 100) {
      return ['Finished', '#3FBE7F'];
    } else if (projectData.progress >= 0) {
      return ['Ongoing', '#F6B943'];
    } else {
    }
  };

  return (
    <Card
      sx={{
        width: '100%',
        px: 3,
        boxShadow: 2,
        mb: 2,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ display: 'flex', py: 1, gap: 1 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                fontSize: '22px',
              }}
            >
              {projectData.name}
            </Typography>
          </Grid>
          <Grid item xs={4} sm={4} md={4} lg={5} xl={5}>
            <Typography
              color="text.secondary"
              variant="body1"
              sx={{ textWrap: 'balance', textAlign: 'center' }}
            >
              {`Due: ${projectData.endDate}`}
            </Typography>
          </Grid>
          <Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
            <Box
              sx={{
                backgroundColor: getStatusColour()[1],
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                px: '6px',
                py: '2px',
                borderRadius: '4px',
                display: 'flex',
                width: '60px',
              }}
            >
              <Typography
                sx={{
                  fontSize: '11px',
                  mx: 'auto',
                  fontWeight: 'bold',
                }}
              >
                {getStatusColour()[0]}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2} sm={2} md={2} lg={1} xl={1}>
            <CardActions disableSpacing>
              <ExpandMore
                expand={expanded}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </CardActions>
          </Grid>
        </Grid>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Divider sx={{ my: 2 }} />

          <Typography
            color="text.secondary"
            variant="h6"
            sx={{ textWrap: 'balance', mb: 2 }}
          >
            Tasks: {projectData.tasks}
          </Typography>

          <Box sx={{ display: 'flex' }}>
            <Typography
              variant="h2"
              sx={{ fontSize: '18px', fontWeight: 600, mb: 1 }}
            >
              Weekly Project Reports:
            </Typography>
            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  await fetchAPIRequest('/feedback/project', 'POST', {
                    projectId: projectData.id,
                    projectName: projectData.name,
                  }).then(() => {
                    setIsEdit((prev) => !prev);
                  });
                } catch (error) {
                  console.log(error);
                } finally {
                  setLoading(false);
                }
              }}
              sx={{ marginLeft: 'auto', my: 'auto', borderRadius: '10px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </Button>
          </Box>
          {reportData.length === 0 ? (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 400,
                fontSize: '16px',
              }}
            >
              No Reports
            </Typography>
          ) : (
            reportData.toReversed().map((data, index) => {
              return (
                <Accordion
                  key={data.timestamp}
                  reportData={data}
                  index={index}
                />
              );
            })
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
