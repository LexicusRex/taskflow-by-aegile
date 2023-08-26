import { Button } from '@mui/material';
import useModal from '../../hooks/useModal';
import { Modal } from '../../components';
import NewProjectForm from './NewProjectForm';

const NewProjectButton = ({ userData, setIsEdit }) => {
  const { isModalShown, toggleModal } = useModal();
  return (
    <>
      <Modal
        isModalShown={isModalShown}
        toggleModal={toggleModal}
        modalTitle="Create New Project"
        purpose="new"
      >
        <NewProjectForm
          toggleModal={toggleModal}
          userData={userData}
          setIsEdit={setIsEdit}
        />
      </Modal>
      <Button
        variant="contained"
        sx={{
          borderRadius: '20px',
          px: 3,
        }}
        onClick={toggleModal}
      >
        + New Project
      </Button>
    </>
  );
};
export default NewProjectButton;
