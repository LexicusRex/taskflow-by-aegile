import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import useModal from '../../hooks/useModal';
import { Modal } from '../../components';
import EditProfileForm from './EditProfileForm';

const EditProfileBtn = ({ userData, setIsEdit }) => {
  const { isModalShown, toggleModal } = useModal();
  return (
    <>
      <Modal
        isModalShown={isModalShown}
        toggleModal={toggleModal}
        modalTitle="Edit Profile"
      >
        <EditProfileForm
          userData={userData}
          setIsEdit={setIsEdit}
          toggleModal={toggleModal}
        />
      </Modal>
      <Button
        variant="contained"
        color="muted"
        sx={{
          width: 140,
          height: 30,
          textTransform: 'none',
          float: 'right',
          ml: 'auto',
          // zIndex: 2,
          position: 'relative',
          top: '50px',
          right: '20px',
        }}
        startIcon={<EditIcon />}
        onClick={toggleModal}
      >
        Edit Profile
      </Button>
    </>
  );
};
export default EditProfileBtn;
