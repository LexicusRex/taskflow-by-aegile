import {
  Box,
  Divider,
  TextField,
  Typography,
  Button,
  AvatarGroup,
  Avatar,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FetchBtn } from '../../components';
import { AddMemberDropDown } from '../../components';
import dayjs from 'dayjs';

// Add member
import { fetchAPIRequest } from '../../helpers';

// Date picker imports
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const NewProjectForm = ({ userData, toggleModal, setIsEdit }) => {
  const [projectName, setProjectName] = useState('');
  const [projectFocus, setProjectFocus] = useState(false);

  const [subheading, setSubheading] = useState('');

  const [members, setMembers] = useState([]);
  const [connections, setConnections] = useState([]);

  const [description, setDescription] = useState('');

  const [date, setDate] = useState(null);
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const connections = await fetchAPIRequest('/connections', 'GET');
        const connectionsObj = {};
        connections.connected.forEach((connection) => {
          connectionsObj[connection.handle] = connection;
        });
        setConnections(connectionsObj);
      } catch (err) {
        console.log(err);
      }
    };
    fetchConnections();
  }, []);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Project Details
      </Typography>
      <TextField
        fullWidth
        sx={{ mb: 2 }}
        rows={2}
        variant="outlined"
        required
        label="Project Name"
        value={projectName}
        placeholder="Project ABC"
        onChange={(event) => setProjectName(event.target.value)}
        error={!projectName && projectFocus}
        helperText={
          !projectName && projectFocus && '⚠️ Project must have a name!'
        }
        onFocus={() => setProjectFocus(true)}
        onBlur={() => setProjectFocus(false)}
      />
      <TextField
        fullWidth
        sx={{ mb: 2 }}
        rows={2}
        variant="outlined"
        label="Subheading"
        value={subheading}
        placeholder="Sub"
        onChange={(event) => setSubheading(event.target.value)}
      />
      <TextField
        fullWidth
        multiline
        sx={{ mb: 2 }}
        rows={2}
        variant="outlined"
        label="Description"
        value={description}
        placeholder="This project consists of..."
        onChange={(event) => setDescription(event.target.value)}
      />

      <Divider sx={{ my: 3 }} />

      {/* Bottom Section */}
      <Box
        sx={{
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Members
            </Typography>
            {/* Members section */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ mb: 2 }}>
                {/* Members section */}
                <Box sx={{ display: 'flex' }}>
                  {/* Member icons */}
                  <AvatarGroup max={4}>
                    {members.map((member, index) => (
                      <Avatar
                        key={member}
                        alt={connections[member]?.name}
                        src={connections[member]?.image}
                        sx={{ ml: -2 }}
                      >
                        {connections[member].name}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Box sx={{ '&:hover': { cursor: 'pointer' } }}>
                    {/* Change the add button alter */}
                    <AddMemberDropDown
                      connections={Object.values(connections)}
                      members={members}
                      setMembers={setMembers}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box>
            <Typography variant="h6">Deadline</Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker']}>
                <DatePicker
                  label="Deadline *"
                  value={date}
                  onChange={(event) => setDate(event)}
                  disablePast
                />
              </DemoContainer>
            </LocalizationProvider>
          </Box>
        </Box>
      </Box>
      {/* Bottom buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <FetchBtn
          btnText="Create Project"
          isDisabled={!projectName || !date}
          variant="contained"
          isFullWidth
          styles={{
            borderRadius: '10px',
            textTransform: 'none',
            fontSize: 20,
            mr: 1,
          }}
          route="/project/new"
          method="POST"
          bodyData={{
            name: projectName,
            subheading: subheading === '' ? 'Subheading' : subheading,
            description: description,
            endDate: dayjs(date).format('DD/MM/YYYY'),
            members: members,
          }}
          setIsEdit={setIsEdit}
          toggleModal={toggleModal}
        />
        <Button
          color="primary"
          fullWidth
          variant="outlined"
          onClick={() => {
            toggleModal();
          }}
          margin="dense"
          sx={{ ml: 1, borderRadius: '10px' }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};
export default NewProjectForm;
