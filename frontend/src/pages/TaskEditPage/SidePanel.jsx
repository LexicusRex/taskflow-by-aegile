import { Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TaskContext } from '../../context/TaskSidePanelContext';
import { useContext } from 'react';
import TaskCommentActions from './TaskCommentActions';

const SidePanel = () => {
  const taskCtx = useContext(TaskContext);
  return (
    <Box
      sx={{
        width: taskCtx.isOpen ? '400px' : 0,
        position: '-webkit-sticky' /* Safari */,
        position: 'sticky',
        top: 0,
        flexGrow: 1,
        height: '100vh',
        transition: 'width 0.2s ease-in-out',
        background: '#fff',
        boxShadow: 3,
        zIndex: 1,
        pt: taskCtx.isOpen ? 3 : 0,
        px: taskCtx.isOpen ? 2 : 0,
        boxSizing: 'border-box',
      }}
    >
      {taskCtx.isOpen && (
        <Box sx={{ width: '100%' }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              taskCtx.toggleOff();
            }}
            sx={{
              width: 30,
              height: 30,
              float: 'right',
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {taskCtx.title}
          </Typography>
          <Box
            sx={{ height: '90dvh', display: 'flex', flexDirection: 'column' }}
          >
            <Box
              sx={{ flexGrow: 1, overflowY: 'auto', scrollbarWidth: 'thin' }}
            >
              {taskCtx.body}
            </Box>
            {taskCtx.type === 'comments' && (
              <TaskCommentActions
                taskId={taskCtx.replyTaskId}
                replyUser={taskCtx.replyUser}
                replyId={taskCtx.replyId}
                isReplying={taskCtx.isReplying}
                cancelReply={taskCtx.cancelReply}
                refresh={() => taskCtx.comment(taskCtx.replyTaskId)}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
    // </>
  );
};
export default SidePanel;
