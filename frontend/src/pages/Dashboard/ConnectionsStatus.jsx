import { Avatar, Box, Divider, Skeleton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const getBusynessColor = (busyness) => {
  if (busyness <= 40) return { busyColor: '#7BEF6BAA', busyStatus: 'light' };
  if (busyness <= 70) return { busyColor: '#FFEE4FAA', busyStatus: 'moderate' };
  if (busyness <= 100) return { busyColor: '#FBB16DAA', busyStatus: 'busy' };
  if (busyness > 100)
    return { busyColor: '#FF6C74AA', busyStatus: 'overloaded' };
};

const ConnectionsStatus = ({ image, name, busyness, handle, isLoading }) => {
  const navigate = useNavigate();

  return isLoading ? (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Skeleton
        variant="circular"
        width={40}
        height={40}
        sx={{ my: 1, mx: 1 }}
      />
      <Skeleton variant="rounded" height={40} width="100%" sx={{ my: 1 }} />
    </Box>
  ) : (
    <Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          '&:hover': {
            cursor: 'pointer',
            backgroundColor: 'rgba(135, 124, 228, 0.2)',
          },
          py: 1,
        }}
        onClick={() => {
          navigate(`/u/${handle}`);
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '70%',
          }}
        >
          <Avatar src={image} alt={handle} sx={{ ml: 1 }}>
            {name.split(' ')[0][0] + name.split(' ')[1][0]}
          </Avatar>
          <Typography
            sx={{
              fontSize: 18,
              px: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {name}
          </Typography>
        </Box>
        <Typography
          sx={{
            pl: 2,
          }}
        >
          {busyness}%
        </Typography>
        <Box
          sx={{
            width: 25,
            height: 25,
            borderRadius: '50%',
            backgroundColor: getBusynessColor(busyness).busyColor,
            mr: 1,
          }}
        />
      </Box>
      <Divider sx={{ my: 1 }} />
    </Box>
  );
};
export default ConnectionsStatus;
