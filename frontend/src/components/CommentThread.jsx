import { Box, Divider } from '@mui/material';
import Comment from './Comment';

const CommentThread = ({
  parent,
  replies,
  setReplyUser,
  setReplyId,
  setIsReplying,
}) => {
  console.log(parent);
  console.log(replies);
  return (
    <Box sx={{ borderBottom: '1px solid #ddd', width: '100%' }}>
      <Comment
        commentId={parent.id}
        sender={parent.name}
        handle={parent.poster}
        content={parent.text}
        timestamp={parent.time}
        setReplyUser={setReplyUser}
        setReplyId={setReplyId}
        setIsReplying={setIsReplying}
      />
      {replies && <Divider sx={{ my: 1, ml: '40px' }} />}
      {replies?.map((reply) => (
        <Comment
          commentId={reply.id}
          sender={reply.name}
          handle={reply.poster}
          content={reply.text}
          timestamp={reply.time}
          isReply
          setReplyUser={setReplyUser}
          setReplyId={setReplyId}
          setIsReplying={setIsReplying}
        />
      ))}
    </Box>
  );
};
export default CommentThread;
