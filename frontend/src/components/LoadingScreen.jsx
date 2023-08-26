import { Box, Typography, LinearProgress } from '@mui/material';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="h5" sx={{ mb: 1 }}>
        Loading...
      </Typography>
      <LinearProgress sx={{ width: '50%' }} />
    </Box>
  );
};
export default LoadingScreen;
