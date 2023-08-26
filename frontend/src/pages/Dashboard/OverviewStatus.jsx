import { Box, Typography } from '@mui/material';

const OverviewStatus = ({ value, type, change }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        p: 3,
        justifyContent: 'center',
        // backgroundColor: 'rgba(135, 124, 228, 0.2)',
        alignItems: 'center',
        boxShadow: 3,
        borderRadius: 3,
      }}
    >
      <Typography variant='h4'>{value}</Typography>
      <Typography sx={{ my: 2 }}>{type}</Typography>
      <Typography
        sx={{ fontSize: 12, textWrap: 'balance', textAlign: 'center' }}
      >
        Total number of {type === 'Tasks' ? 'active ' : ' '}
        {type.toLowerCase()}.
      </Typography>
      {/* <Typography
        sx={{ fontSize: 12, textWrap: 'balance', textAlign: 'center' }}
      >
        {change > 0 ? '+' : change === 0 ? '~' : '-'}
        {Math.abs(change)}%{' '}
        {change > 0 ? 'increase' : change === 0 ? 'no change' : 'decrease'} from
        last week
      </Typography> */}
    </Box>
  );
};
export default OverviewStatus;
