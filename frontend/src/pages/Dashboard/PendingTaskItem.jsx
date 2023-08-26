import { Grid, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PendingTaskItem = ({
  projectId,
  project,
  taskName,
  priority,
  workload,
  deadline,
  status,
  isLoading,
  isHeader = false,
}) => {
  const navigate = useNavigate();

  return !isHeader && isLoading ? (
    <Skeleton variant="rounded" height={30} sx={{ my: 0.5 }} />
  ) : (
    <Grid
      container
      columnSpacing={2}
      columns={12}
      sx={{
        py: 1,
        px: 1,
        boxSizing: 'border-box',
        '&:hover': {
          cursor: !isHeader && 'pointer',
          backgroundColor: !isHeader && 'rgba(135, 124, 228, 0.2)',
          textDecoration: !isHeader && 'underline',
        },
      }}
      onClick={() => navigate(`/projects/${projectId}`)}
    >
      <Grid
        item
        xs={3}
        sm={3}
        md={3}
        lg={3}
        xl={2}
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: { xs: 'none', md: 'block' },
        }}
      >
        {project}
      </Grid>
      <Grid
        item
        xs={10}
        sm={10}
        md={5}
        lg={5}
        xl={4}
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {taskName}
      </Grid>
      <Grid
        item
        sx={{ textAlign: 'center', display: { xs: 'none', xl: 'block' } }}
        xs={1}
      >
        {priority}
      </Grid>
      <Grid
        item
        sx={{ textAlign: 'center', display: { xs: 'none', xl: 'block' } }}
        xs={1}
      >
        {workload}
      </Grid>
      <Grid item xs={2} md={2}>
        {deadline}
      </Grid>
      <Grid item xs={2} sx={{ display: { xs: 'none', md: 'block' } }}>
        {status}
      </Grid>
    </Grid>
  );
};
export default PendingTaskItem;
