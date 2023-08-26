import { Box } from '@mui/material';
import useModal from '../../hooks/useModal';
import { Modal } from '../../components';
import TaskForm from './TaskForm';

const NewTaskButton = ({ userData, taskStatus, setIsEdit }) => {
  const { isModalShown, toggleModal } = useModal();
  return (
    <>
      <Modal
        isModalShown={isModalShown}
        toggleModal={toggleModal}
        modalTitle="Create New Task"
        purpose="new"
      >
        <TaskForm
          purpose={'create'}
          toggleModal={toggleModal}
          userData={userData}
          taskStatus={taskStatus}
          setIsEdit={setIsEdit}
        />
      </Modal>
      <Box
        variant="contained"
        sx={{
          display: 'flex',
          borderRadius: '10px',
          width: '25px',
          height: '25px',
          backgroundColor: 'rgb(131, 120, 227, 0.3)',
          justifyContent: 'center',
          textAlign: 'center',
          alignItems: 'center',
          '&:hover': {
            cursor: 'pointer',
          },
        }}
        onClick={toggleModal}
      >
        <Box
          sx={{
            color: '#A888A8',
            fontSize: '20px',
            marginBottom: '5px',
          }}
        >
          +
        </Box>
      </Box>
    </>
  );
};
export default NewTaskButton;
