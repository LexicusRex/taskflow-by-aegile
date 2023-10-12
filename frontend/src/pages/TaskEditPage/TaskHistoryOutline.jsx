import useModal from '../../hooks/useModal';
import { Modal } from '../../components';
import { Editor } from '../../components';
import { Box, Button, Typography } from '@mui/material';

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
          {Date(editTimestamp * 1000).toLocaleString('en-GB')}
        </Typography>
        <Editor initialBlocks={editContent} />
      </Modal>
      <Box
        key={'edit' + index}
        sx={{
          py: 1,
          px: 2,
          flexGrow: 1,
          boxSizing: 'border-box',
          border: '1px solid darkcyan',
          borderRadius: 3,
          mb: 2,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleModal();
        }}
      >
        <Typography key={'edit-poster' + editTimestamp}>
          {new Date(editTimestamp * 1000).toLocaleString()}
        </Typography>
      </Box>
    </>
  );
};
export default TaskHistoryOutline;
