import { Box, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ReactTimeAgo from 'react-time-ago';
import { fetchAPIRequest } from '../../helpers';

export default function Comment({
  id,
  text,
  sender,
  time,
  replyHandle,
  replyText,
  handleReply,
}) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchAPIRequest(`/user?handle=${sender}`, 'GET');
        setUser(response);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, [sender]);
  return (
    <Box sx={{ display: 'flex', gap: 1, marginBottom: 1 }}>
      <Box sx={{ marginBottom: 'auto', display: 'flex', paddingTop: '5px' }}>
        <img
          height={30}
          width={30}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          src={user?.image}
          alt=""
        />
      </Box>
      <Box>
        {replyHandle !== null && (
          <Box sx={{ px: 1, fontSize: '11px', color: '#8378e3' }}>
            ↪ @{replyHandle} {replyText}
          </Box>
        )}
        <Typography
          sx={{
            fontSize: '13px',
            px: 1,
          }}
        >
          {user?.firstName} {user?.lastName}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', px: 1 }}>
          <Box
            sx={{
              paddingBottom: '3px',
              display: 'inline-block',
              fontSize: '14px',
            }}
          >
            {text}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ my: 'auto' }}>
              <Typography
                onClick={() => {
                  handleReply(sender, id);
                }}
                variant="h6"
                sx={{
                  fontSize: '10px',
                  my: 'auto',
                  '&:hover': {
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: '#5d5d64',
                  },
                }}
              >
                Reply
              </Typography>
            </Box>
            <Box
              sx={{
                fontSize: '10px',
                my: 'auto',
                color: '#5d5d64',
                mb: '2px',
              }}
            >
              <ReactTimeAgo date={new Date(time * 1000)} locale="en-US" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
