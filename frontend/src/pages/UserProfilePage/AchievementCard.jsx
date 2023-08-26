import { Box, Typography } from '@mui/material';

import * as Icons from '../../assets/index.js';

const AchievementCard = ({ achievementData }) => {
  const AchievementIcon = Icons[achievementData.icon];
  const progressPercentage =
    (parseInt(achievementData.progress, 10) / achievementData.requirement) *
    100;
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 3,
        boxShadow: 3,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 2,
        boxSizing: 'border-box',
      }}
    >
      {achievementData.progress >= achievementData.requirement ? (
        <Box sx={{ mr: 2 }}>
          {/* <Icons.iconName width='70' /> */}

          <AchievementIcon width='50' height='50' />
        </Box>
      ) : (
        <Box sx={{ mr: 2, opacity: 0.4 }}>
          <AchievementIcon width='50' height='50' />
        </Box>
      )}

      <Box sx={{ width: '100%' }}>
        <Typography>{achievementData.name}</Typography>
        <Typography color='text.secondary' sx={{ textWrap: 'balance' }}>
          {achievementData.description}
        </Typography>
        <Box
          sx={{
            textAlign: 'center',
            width: '100%',
            height: 20,
            backgroundColor: '#DEDEDE',
            borderRadius: 50,
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: 20,
              backgroundImage: `linear-gradient(to right, #8378E366 ${progressPercentage}%, #DEDEDE ${progressPercentage}%)`,
              borderRadius: 50,
            }}
          />
          <Box fontSize={10} sx={{ position: 'relative', top: -18 }}>
            {achievementData.progress >= achievementData.requirement ? (
              <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
                Complete
              </Typography>
            ) : (
              <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
                {`${achievementData.progress}/${achievementData.requirement}`}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default AchievementCard;
