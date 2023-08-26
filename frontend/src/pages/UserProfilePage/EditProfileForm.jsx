import {
  Box,
  Divider,
  TextField,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FetchBtn, ImageUploadBtn } from '../../components';
import ImageIcon from '@mui/icons-material/Image';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ClearIcon from '@mui/icons-material/Clear';

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,20}$/;

const EditProfileForm = ({ userData, setIsEdit, toggleModal }) => {
  const [email, setEmail] = useState(userData?.email);
  const [isValidEmail, setValidEmail] = useState(false);
  const [isEmailFocus, setEmailFocus] = useState(false);

  const [firstName, setFirstName] = useState(userData?.first_name);
  const [lastName, setLastName] = useState(userData?.last_name);

  const [description, setDescription] = useState(userData?.description);
  const [skills, setSkills] = useState({});

  const [password, setPassword] = useState('');
  const [isValidPassword, setValidPassword] = useState(false);
  const [isPasswordFocus, setPasswordFocus] = useState(false);

  const [passwordMatch, setPasswordMatch] = useState('');
  const [isValidMatch, setValidMatch] = useState(false);
  const [isMatchFocus, setMatchFocus] = useState(false);

  const [profilePicture, setProfilePicture] = useState('');
  const [compressedProfilePicture, setCompressedProfilePicture] = useState('');

  const [profileBanner, setProfileBanner] = useState('');

  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  useEffect(() => {
    const result = PASSWORD_REGEX.test(password);
    setValidPassword(result);
    setValidMatch(password === passwordMatch);
  }, [password, passwordMatch]);

  useEffect(() => {
    const userSkills = {};
    userData?.skills?.split(',').forEach((skill) => (userSkills[skill] = true));
    setSkills(userSkills);
  }, [userData]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Images
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <ImageUploadBtn
          btnText="Profile Picture"
          btnIcon={<AccountCircleIcon />}
          callback={setProfilePicture}
          compressedCallback={setCompressedProfilePicture}
          isToCompress
        />
        <ImageUploadBtn
          btnText="Banner"
          btnIcon={<ImageIcon />}
          callback={setProfileBanner}
        />
      </Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>
        Display Details
      </Typography>
      <TextField
        multiline
        fullWidth
        rows={2}
        variant="outlined"
        label="Description"
        value={description ? description: '' }
        onChange={(event) => setDescription(event.target.value)}
        sx={{ mb: 3 }}
      />
      <Box sx={{ display: 'flex', mb: 1, flexWrap: 'wrap' }}>
        {Object.keys(skills).map((skill) => (
          <Typography
            key={skill}
            sx={{
              pl: 2,
              pr: 1,
              py: 1,
              m: 0.5,
              borderRadius: '50px',
              fontSize: {
                xs: 12,
                sm: 14,
              },
              maxHeight: {
                xs: 20,
                md: 30,
              },
              backgroundColor: '#D9D9D980',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {skill}{' '}
            <IconButton
              sx={{ width: 25, height: 25, ml: 1 }}
              onClick={() => {
                const newSkills = { ...skills };
                delete newSkills[skill];
                setSkills(newSkills);
              }}
            >
              <ClearIcon sx={{ width: 15, height: 15 }} />
            </IconButton>
          </Typography>
        ))}
      </Box>
      <TextField
        fullWidth
        variant="outlined"
        label="Add Skills"
        type="text"
        helperText="Type a skill and press enter to add a skill"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            setSkills((prevSkills) => {
              return {
                ...prevSkills,
                [event.target.value]: true,
              };
            });
            event.target.value = '';
          }
        }}
      />
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>
        User Details
      </Typography>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <TextField
          sx={{ maxWidth: '45%' }}
          variant="outlined"
          label="First Name"
          required
          placeholder="John"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
        <TextField
          sx={{ maxWidth: '45%' }}
          variant="outlined"
          label="Surname"
          required
          placeholder="Smith"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
      </Box>
      <TextField
        fullWidth
        variant="outlined"
        label="Email"
        type="email"
        required
        placeholder="john.smith@gmail.com"
        error={isEmailFocus && !isValidEmail}
        helperText={
          isEmailFocus && !isValidEmail && '⚠️ Please enter a valid email.'
        }
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onFocus={() => setEmailFocus(true)}
        onBlur={() => setEmailFocus(false)}
        sx={{ mb: 3 }}
      />
      <TextField
        variant="outlined"
        label="Password"
        type="password"
        fullWidth
        required
        placeholder="••••••••••"
        error={isPasswordFocus && !isValidPassword}
        helperText={
          isPasswordFocus &&
          !isValidPassword && (
            <span>
              Your password must be between <b>8 to 20 characters</b> contain at
              least:
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>A special character</li>
            </span>
          )
        }
        onChange={(event) => setPassword(event.target.value)}
        onFocus={() => setPasswordFocus(true)}
        onBlur={() => setPasswordFocus(false)}
        sx={{ mb: 3 }}
      />
      <TextField
        variant="outlined"
        label="Confirm Password"
        type="password"
        placeholder="••••••••••"
        fullWidth
        required
        error={isMatchFocus && !isValidMatch}
        helperText={
          isMatchFocus && !isValidMatch && '⚠️ Your passwords must match.'
        }
        onChange={(event) => setPasswordMatch(event.target.value)}
        onFocus={() => setMatchFocus(true)}
        onBlur={() => setMatchFocus(false)}
        sx={{ mb: 5 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <FetchBtn
          btnText="Save Changes"
          isDisabled={
            !!(
              (password && !isValidPassword) ||
              !isValidMatch ||
              (email && !isValidEmail)
            )
          }
          variant="contained"
          isFullWidth
          styles={{
            borderRadius: '10px',
            textTransform: 'none',
            fontSize: 20,
            mr: 1,
          }}
          route="/profile/edit"
          method="PUT"
          bodyData={{
            firstName,
            lastName,
            email,
            password,
            description,
            skills: Object.keys(skills).toString(),
            handle: userData?.handle,
            image: compressedProfilePicture,
            rawImage: profilePicture,
            banner: profileBanner,
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
export default EditProfileForm;
