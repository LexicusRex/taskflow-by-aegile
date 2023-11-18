import {
  Box,
  Button,
  Typography,
  InputLabel,
  AvatarGroup,
  Avatar,
  Tooltip,
  IconButton,
  TextField,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const Comment = ({
  commentId,
  sender,
  handle,
  content,
  timestamp,
  setReplyUser,
  setReplyId,
  setIsReplying,
  isReply = false,
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        pb: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1,
            ml: isReply && '40px',
          }}
        >
          <Avatar sx={{ width: '30px', height: '30px' }} />
          <Typography sx={{ ml: 1, fontSize: '1.15rem' }}>{sender}</Typography>
        </Box>
        <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
          {new Date(timestamp * 1000).toLocaleString('en-GB', {
            // weekday: 'short',
            // year: 'numeric',
            day: 'numeric',
            month: 'short',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
      </Box>
      <Box sx={{ ml: isReply ? '77.5px' : '37.5px' }}>
        <Typography
          sx={{ textWrap: 'balance', fontSize: '0.95rem', fontWeight: 300 }}
        >
          {content}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.95rem',
            color: '#666',
            my: 1,
          }}
        >
          <Box
            sx={{
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={() => {
              if (!isReply) {
                setReplyUser(`${sender} @${handle}`);
                setReplyId(commentId);
                setIsReplying(true);
              }
            }}
          >
            Reply
          </Box>
          <Box sx={{ mx: 1 }}>|</Box>
          <IconButton size="small">
            <ThumbUpIcon fontSize="inherit" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
export default Comment;
