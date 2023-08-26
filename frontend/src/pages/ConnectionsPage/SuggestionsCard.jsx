import { Box, Divider, Skeleton, Typography } from '@mui/material';
import { FetchBtn } from '../../components';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const SuggestionsCard = ({ handle, name, image, skills, setIsEdit }) => {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <Box
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 2,
        py: 2,
        boxSizing: 'border-box',
        backgroundColor: '#fff',
      }}
    >
      {isLoading && (
        <Skeleton variant="circular" width={150} height={150} sx={{ mb: 2 }} />
      )}
      <Box
        component="img"
        src={image ? image : 'https://unsplash.it/150/150'}
        alt="user-profile-pic"
        sx={{
          borderRadius: '50%',
          mb: 2,
          width: 150,
          height: 150,
          mt: isLoading ? '-165px' : 0,
          objectFit: 'cover',
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
      />

      {isLoading ? (
        <Skeleton variant="rounded" width={200} height={30} sx={{ mb: 1 }} />
      ) : (
        <Typography
          variant="h6"
          fontWeight={600}
          sx={{
            mb: 1,
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          <Link
            to={`/u/${handle}`}
            style={{ color: '#000', textDecoration: 'none' }}
          >
            {name}
          </Link>
        </Typography>
      )}
      {isLoading ? (
        <Skeleton variant="rounded" width={300} height={50} sx={{ mb: 1 }} />
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignContent: 'start',
            justifyContent: 'center',
            maxHeight: 105,
            overflowY: 'hidden',
          }}
        >
          {skills?.split(',').map((skill, index) => {
            return (
              <Typography
                key={'skill' + index}
                sx={{
                  px: 2,
                  py: 0.5,
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
      )}
      <Divider sx={{ my: 2 }} />
      <FetchBtn
        btnText="Connect"
        btnIcon={<PersonAddIcon />}
        variant="contained"
        route="/connections"
        method="POST"
        bodyData={{ target: handle }}
        setIsEdit={setIsEdit}
      />
    </Box>
  );
};
export default SuggestionsCard;
