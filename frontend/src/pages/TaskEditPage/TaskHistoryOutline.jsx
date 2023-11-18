import useModal from '../../hooks/useModal';
import { Modal } from '../../components';
import { Editor } from '../../components';
import { Box, Button, Typography, Divider } from '@mui/material';

const TaskHistoryOutline = ({ index, editTimestamp, editContent }) => {
  const { isModalShown, toggleModal } = useModal();
  return (
    <>
      <Modal
        isModalShown={isModalShown}
        toggleModal={() => {
          toggleModal();
        }}
        modalTitle="Edit History Preview"
        onClick={(e) => {
          e.stopPropagation();
        }}
        actions={<Button onClick={toggleModal}>Close</Button>}
      >
        <Typography color="text.secondary">
          {new Date(editTimestamp * 1000).toLocaleString('en-GB', {
            // weekday: 'short',
            year: 'numeric',
            day: 'numeric',
            month: 'short',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Editor initialBlocks={editContent} />
      </Modal>
      <Box
        key={'edit' + index}
        sx={{
          py: 1,
          px: 2,
          flexGrow: 1,
          boxSizing: 'border-box',
          borderBottom: '1px solid #ddd',
          borderRadius: 3,
          width: '100%',
          mb: 2,
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleModal();
        }}
      >
        <Typography
          key={'edit-poster' + editTimestamp}
          sx={{ fontWeight: index > 0 && 300 }}
        >
          {new Date(editTimestamp * 1000).toLocaleString()}
        </Typography>
      </Box>
    </>
  );
};
export default TaskHistoryOutline;
