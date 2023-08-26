import {
  Button,
  Box,
  Typography,
  TextField,
  Link,
  LinearProgress,
} from '@mui/material';
import { useState, useContext, useEffect } from 'react';
import { AlertContext } from '../context/AlertContext';
import { fetchAPIRequest } from '../helpers';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as Logo } from '../assets/logo.svg';

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,20}$/;

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isValidEmail, setValidEmail] = useState(false);
  const alertCtx = useContext(AlertContext);
  const [requestBtnClicked, setRequestBtnClicked] = useState(false);

  const [isRequestSent, setIsRequestSent] = useState(false);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isValidPassword, setValidPassword] = useState(false);

  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  useEffect(() => {
    const result = PASSWORD_REGEX.test(password);
    setValidPassword(result);
  }, [password]);

  const handleRequest = async () => {
    try {
      setRequestBtnClicked(true);
      await fetchAPIRequest('/auth/pasword/requestreset', 'POST', {
        email,
      });
      alertCtx.success('Email sent. Please check your inbox!');
      setIsRequestSent(true);
    } catch (err) {
      alertCtx.error(err.message);
      setRequestBtnClicked(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetchAPIRequest('/auth/pasword/reset', 'POST', {
        email,
        newPassword: password,
        code,
      });
      alertCtx.success('Password reset! Please sign in.');
      navigate('/login');
    } catch (err) {
      alertCtx.error(err.message);
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: "url('https://unsplash.it/1920/1080')",
      }}
    >
      <Box
        sx={{
          backgroundColor: '#fff',
          py: 3,
          px: { xs: 5, md: 15 },
          borderRadius: 3,
          boxShadow: 5,
          width: { xs: '95%', sm: '80%', md: '60%', lg: '35%' },
          minHeight: '55%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          boxSizing: 'border-box',
        }}
      >
        <Logo style={{ width: 150 }} />
        <Typography variant='h4'>Password Reset</Typography>
        {!isRequestSent && !requestBtnClicked && (
          <TextField
            fullWidth
            autoFocus
            variant='standard'
            label='Email'
            type='email'
            required
            placeholder='john.smith@gmail.com'
            error={!isValidEmail}
            helperText={!isValidEmail && '⚠️ Please enter a valid email.'}
            onChange={(event) => setEmail(event.target.value)}
            sx={{ mb: 3 }}
          />
        )}
        {isRequestSent && (
          <>
            <TextField
              fullWidth
              autoFocus
              variant='standard'
              label='Verification Code'
              type='number'
              required
              placeholder='1234'
              onChange={(event) => setCode(event.target.value)}
              sx={{ mb: 3 }}
            />
            <TextField
              variant='standard'
              label='Password'
              type='password'
              fullWidth
              required
              placeholder='••••••••••'
              error={!isValidPassword}
              helperText={
                !isValidPassword && (
                  <span>
                    Your password must be between <b>8 to 20 characters</b>{' '}
                    contain at least:
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>A special character</li>
                  </span>
                )
              }
              onChange={(event) => setPassword(event.target.value)}
              sx={{ mb: 3 }}
            />
          </>
        )}
        {!isRequestSent && !requestBtnClicked && (
          <Button
            variant='contained'
            disabled={!isValidEmail}
            onClick={handleRequest}
            sx={{
              width: '100%',
              mb: 2,
              borderRadius: '10px',
              textTransform: 'none',
              fontSize: 20,
            }}
          >
            Send Email
          </Button>
        )}
        {!isRequestSent && requestBtnClicked && (
          <Box>
            <Typography variant='h6'>Sending Email. Please wait...</Typography>
            <LinearProgress />
          </Box>
        )}

        {isRequestSent && (
          <Button
            variant='contained'
            disabled={!isValidPassword}
            onClick={handleReset}
            sx={{
              width: '100%',
              mb: 2,
              borderRadius: '10px',
              textTransform: 'none',
              fontSize: 20,
            }}
          >
            Reset Password
          </Button>
        )}
        <Typography
          color='text.secondary'
          sx={{ textAlign: 'center', textWrap: 'balance' }}
        >
          {"Don't need to reset your password? "}
          <Link
            // variant="body2"
            component='a'
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onClick={() => navigate('/login')}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
export default PasswordResetPage;
