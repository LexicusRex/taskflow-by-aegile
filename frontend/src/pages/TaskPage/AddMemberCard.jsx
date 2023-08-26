import { Avatar, Box, Checkbox, MenuItem, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const getBusynessColor = (busyness) => {
  if (busyness <= 40) return { busyColor: '#7BEF6B', busyStatus: 'light' };
  if (busyness <= 70) return { busyColor: '#FFEE4F', busyStatus: 'moderate' };
  if (busyness <= 100) return { busyColor: '#FBB16D', busyStatus: 'busy' };
  if (busyness > 100) return { busyColor: '#FF6C74', busyStatus: 'overloaded' };
};

const AddMemberCard = ({
  name,
  handle,
  image,
  busyness,
  skills,
  assigned,
  setMembers,
}) => {
  const [isChecked, setIsChecked] = useState(assigned ? assigned : false);

  useEffect(() => {
    setIsChecked(assigned);
  }, [assigned]);

  return (
    <MenuItem
      onClick={() => {
        setIsChecked((prev) => !prev);
        isChecked
          ? setMembers((members) =>
              members.filter((member) => member !== handle)
            )
          : setMembers((members) => [...members, handle]);
      }}
      sx={{ flexGrow: 1, width: '100%' }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          boxSizing: 'border-box',
        }}
      >
        <Checkbox disableRipple checked={isChecked} />
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            ml: 1,
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar alt={name} src={image} />
            <Typography
              sx={{
                fontSize: 18,
                ml: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
              <Typography
                fontSize="14"
                sx={{ ml: 2, display: { xs: 'none', md: 'block' } }}
              >
                {busyness}% {getBusynessColor(busyness).busyStatus}
              </Typography>
              <Box
                sx={{
                  width: 100,
                  height: 20,
                  bgcolor: '#e5e5e5',
                  display: 'flex',
                  justifyContent: 'flex-start',
                  boxSizing: 'border-box',
                  p: '5px',
                  ml: 1,
                  alignItems: 'center',
                  borderRadius: 5,
                }}
              >
                <Box
                  sx={{
                    width: busyness,
                    height: 10,
                    bgcolor: getBusynessColor(busyness).busyColor,
                    border: busyness > 0 && '0.5px solid #00000020',
                    borderRadius: 5,
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignContent: 'center',
              alignItems: 'stretch',
              justifyContent: 'flex-start',
              mt: 1,
              overflowX: 'auto',
            }}
          >
            {skills?.split(',').map((skill, index) => {
              return (
                <Typography
                  key={'skill' + index}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: '50px',
                    fontSize: {
                      xs: 12,
                      sm: 14,
                    },
                    maxHeight: {
                      xs: 20,
                      md: 30,
                    },
                    backgroundColor: '#D9D9D980',
                  }}
                >
                  {skill}
                </Typography>
              );
            })}
          </Box>
        </Box>
      </Box>
    </MenuItem>
  );
};
export default AddMemberCard;
