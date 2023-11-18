import { useState } from 'react';
import { fetchAPIRequest } from '../../helpers';
import { Box, Typography, IconButton, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
const TaskCommentActions = ({
  taskId,
  replyUser,
  replyId,
  isReplying,
  cancelReply,
  refresh,
}) => {
  const [comment, setComment] = useState('');
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <TextField
        label={
          isReplying ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography>Replying to {replyUser}</Typography>
              <IconButton
                size="small"
                onClick={() => {
                  cancelReply(false);
                }}
              >
                <ClearIcon
                  size="small"
                  sx={{
                    width: '20px',
                    height: '20px',
                  }}
                />
              </IconButton>
            </Box>
          ) : (
            'Write a comment...'
          )
        }
        variant="standard"
        sx={{
          ml: 1,
          width: '500px',
          my: 'auto',
        }}
        onChange={(event) => setComment(event.target.value)}
        value={comment}
        focused={isReplying}
      />
      {/* Send icon */}
      <SendIcon
        onClick={async () => {
          const idReply = isReplying === true ? replyId : -1;
          if (comment.length !== 0) {
            await fetchAPIRequest('/task/comment', 'POST', {
              taskId,
              text: comment,
              repliedCommentId: idReply,
            }).then(() => {
              setComment('');
              cancelReply(false);
              refresh();
            });
            //   .then(() => {
            //     setTimeout(() => {
            //       scrollRef.current.scrollIntoView({
            //         behavior: 'smooth',
            //       });
            //     }, 200);
            //   });
          }
        }}
        sx={{
          color: '#a8a8a8',
          my: 'auto',
          mt: '35px',
          '&:hover': {
            color: comment.length === 0 ? '#a8a8a8' : '#8378e3',
            cursor: comment.length === 0 ? 'not-allowed' : 'pointer',
          },
        }}
      />
    </Box>
  );
};
export default TaskCommentActions;
