import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { fetchAPIRequest } from '../../helpers';
import { useParams } from 'react-router-dom';
import { FetchBtn, LoadingScreen, Modal } from '../../components';
import TeamMemberCard from './TeamMemberCard';
import AddIcon from '@mui/icons-material/Add';
import useModal from '../../hooks/useModal';
import TeamAddMemberForm from '../../components/TeamAddMemberForm';

export default function TaskDisplayScreen() {
  const { projectId } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isModalShown, toggleModal } = useModal();
  const [members, setMembers] = useState([]);
  const [newMembers, setNewMembers] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [profileRole, setProfileRole] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchConnections = async () => {
      try {
        const user = await fetchAPIRequest('/profile', 'GET');
        const projectMembers = await fetchAPIRequest(
          `/project/members?projectId=${projectId}`,
          'GET'
        );
        for (const member in projectMembers.members) {
          if (projectMembers.members[member].handle === user.handle) {
            setProfileRole(projectMembers.members[member].role);
          }
        }
        setMembers(projectMembers.members);
        setMyConnections(projectMembers.connections);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchConnections();
  }, [isEdit, projectId]);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Box
      sx={{
        display: 'flex',
        backgroundColor: '#ECEFF1',
        flexGrow: 1,
        overflow: 'auto',
        px: 5,
        py: 2,
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        flex: 6,
        justifyContent: 'space-around',
        alignContent: 'flex-start',
        flexWrap: 'wrap',
        gap: 1,
        maxHeight: '79.5vh',
      }}
    >
      <Box
        sx={{
          height: 40,
          display: 'flex',
          width: '100%',
          justifyContent: 'flex-end',
        }}
      >
        <Modal
          isModalShown={isModalShown}
          toggleModal={toggleModal}
          modalTitle="Add Team Members"
          actions={
            <>
              <FetchBtn
                btnText="Save"
                variant="contained"
                route={'/project/invite'}
                method={'POST'}
                bodyData={{
                  projectId,
                  members: newMembers,
                }}
                isFullWidth={true}
                setIsEdit={setIsEdit}
                toggleModal={toggleModal}
                notificationMsg="Invites sent!"
              />
              <Button
                fullWidth
                color="primary"
                variant="outlined"
                onClick={toggleModal}
                margin="dense"
              >
                Close
              </Button>
            </>
          }
        >
          <TeamAddMemberForm
            fetchMembers={Object.values(myConnections)}
            selectedMembers={newMembers}
            setMembers={setNewMembers}
          />
        </Modal>
        <Button
          size="large"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: 'none', fontSize: 18, height: 40 }}
          onClick={toggleModal}
        >
          Add Member
        </Button>
      </Box>
      <Box
        sx={{
          height: 50,
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          px: 5,
        }}
      >
        <Box
          sx={{
            borderRadius: '50%',
            width: 50,
            height: 50,
            mr: 5,
            display: { xs: 'none', sm: 'none', md: 'block' },
          }}
        />
        <Typography
          variant="h6"
          sx={{ width: '40%', fontSize: { xs: 16, md: 20 } }}
        >
          Member
        </Typography>
        <Typography
          variant="h6"
          sx={{ width: '40%', fontSize: { xs: 16, md: 20 } }}
        >
          Role
        </Typography>
        <Box
          sx={{
            borderRadius: '50%',
            width: 35,
            height: 35,
          }}
        />
      </Box>
      {members.map((member) => (
        <TeamMemberCard
          key={member.handle}
          {...member}
          projectId={projectId}
          setIsEdit={setIsEdit}
          profileRole={profileRole}
        />
      ))}
    </Box>
  );
}
