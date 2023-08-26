import { Button, Box } from '@mui/material';
import useModal from '../../hooks/useModal';
import { Modal } from '../../components';
import EditProjectForm from './EditProjectForm';
import EditIcon from '@mui/icons-material/Edit';

const EditProjectButton = ({ userData, setIsEdit, setIsEditState }) => {
  const { isModalShown, toggleModal } = useModal();

  return (
    <>
      <Modal
        isModalShown={isModalShown}
        toggleModal={() => {
          toggleModal();
          setIsEditState((prev) => !prev);
        }}
        modalTitle='Edit Project'
        onClick={(e) => {
          e.stopPropagation();
        }}
        purpose='edit'
      >
        <EditProjectForm
          toggleModal={() => {
            toggleModal();
            setIsEditState((prev) => !prev);
          }}
          userData={userData}
          setIsEdit={setIsEdit}
          setIsEditState={setIsEditState}
        />
      </Modal>
      <Button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditState(true);
          toggleModal();
        }}
        sx={{
          '&:hover': {
            backgroundColor: '#e7dcff',
          },
          height: '25px',
          width: 'fit-content',
          borderRadius: '10px',
        }}
      >
        <EditIcon fontSize='small' />
        <Box>Edit</Box>
      </Button>
    </>
  );
};
export default EditProjectButton;
