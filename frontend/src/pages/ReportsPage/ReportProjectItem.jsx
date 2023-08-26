import { Grid, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ReportProjectItem = ({
  totalTasks,
  yourTasks,
  start,
  deadline,
  isLoading,
  isHeader = false,
}) => {
  const navigate = useNavigate();

  return !isHeader && isLoading ? (
    <Skeleton variant='rounded' height={30} sx={{ my: 0.5 }} />
  ) : (
    <Grid
      container
      columnSpacing={2}
      columns={9}
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
    >
      <Grid
        item
        xs={3}
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {totalTasks}
      </Grid>
      <Grid
        item
        xs={3}
        sx={{ textAlign: 'center', display: { xs: 'none', xl: 'block' } }}
      >
        {yourTasks}
      </Grid>
      <Grid item xs={3}>
        {deadline}
      </Grid>
    </Grid>
  );
};
export default ReportProjectItem;
