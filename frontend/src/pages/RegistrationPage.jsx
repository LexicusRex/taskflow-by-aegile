import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material';
import { fetchAPIRequest } from '../helpers';
import { ReactComponent as Logo } from '../assets/Taskflow-logo-left.svg';
import { AlertContext } from '../context/AlertContext';

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,20}$/;

const RegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const alertCtx = useContext(AlertContext);

  const [email, setEmail] = useState('');
  const [isValidEmail, setValidEmail] = useState(false);
  const [isEmailFocus, setEmailFocus] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isValidTOC, setIsValidTOC] = useState(false);

  const [password, setPassword] = useState('');
  const [isValidPassword, setValidPassword] = useState(false);
  const [isPasswordFocus, setPasswordFocus] = useState(false);

  const [passwordMatch, setPasswordMatch] = useState('');
  const [isValidMatch, setValidMatch] = useState(false);
  const [isMatchFocus, setMatchFocus] = useState(false);

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
    if (localStorage.getItem('token')) {
      navigate(from, { replace: true });
    }
  }, [from, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await fetchAPIRequest('/auth/register', 'POST', {
        firstName,
        lastName,
        email,
        password,
      });
      alertCtx.success('Welcome to TaskFlow!');
      const token = data?.token;
      localStorage.setItem('token', token);
      localStorage.setItem('notification_status', 'default');
      navigate(from, { replace: true });
    } catch (err) {
      alertCtx.error(err.message);
    }
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <Box
        component="img"
        src="https://unsplash.it/1920/1080"
        sx={{
          width: '50vw',
          height: '100%',
          display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' },
          objectFit: 'cover',
        }}
      ></Box>
      <Box
        sx={{
          width: { xs: '100vw', sm: '100vw', md: '100vw', lg: '50vw' },
          height: '100%',
          textAlign: 'center',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: '50px',
        }}
      >
        <Box
          sx={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: !isPasswordFocus && 'center',
            pt: isPasswordFocus && 7,
            height: '100%',
          }}
        >
          <Logo style={{ width: 500 }} />
          <Typography variant="h3" sx={{ mb: 1 }}>
            Create an Account
          </Typography>
          <Typography variant="h6" fontSize="20" color="text.secondary">
            Welcome! Please enter your details below to sign up.
          </Typography>
          <form
            onSubmit={handleSubmit}
            style={{
              mt: '60px', // 75px without logo
              height: 480,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
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
                variant="standard"
                label="First Name"
                required
                placeholder="John"
                onChange={(event) => setFirstName(event.target.value)}
              />
              <TextField
                sx={{ maxWidth: '45%' }}
                variant="standard"
                label="Surname"
                required
                placeholder="Smith"
                onChange={(event) => setLastName(event.target.value)}
              />
            </Box>
            <TextField
              fullWidth
              variant="standard"
              label="Email"
              type="email"
              required
              placeholder="john.smith@gmail.com"
              error={isEmailFocus && !isValidEmail}
              helperText={
                isEmailFocus &&
                !isValidEmail &&
                '⚠️ Please enter a valid email.'
              }
              onChange={(event) => setEmail(event.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              sx={{ mb: 3 }}
            />
            <TextField
              variant="standard"
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
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              sx={{ mb: 3 }}
            />
            <TextField
              variant="standard"
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
              sx={{ mb: 3 }}
            />
            <FormGroup sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox onClick={() => setIsValidTOC(!isValidTOC)} />
                }
                label={
                  <Typography
                    sx={{
                      textAlign: 'left',
                      display: 'inline-block',
                      fontSize: { xs: 16, md: 20 },
                    }}
                    color="text.secondary"
                  >
                    {'By signing up, you agree with our '}

                    <Link
                      sx={{
                        textAlign: 'left',
                        textDecoration: 'none',
                        fontSize: { xs: 16, md: 20 },
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/toc');
                      }}
                    >
                      {' terms and conditions'}
                    </Link>
                  </Typography>
                }
              />
            </FormGroup>
            <Button
              variant="contained"
              disabled={
                !!(
                  !isValidPassword ||
                  !isValidMatch ||
                  !isValidEmail ||
                  !isValidTOC
                )
              }
              type="submit"
              sx={{
                width: '100%',
                mb: 2,
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: 20,
              }}
            >
              Sign up
            </Button>
            <Typography color="text.secondary">
              {'Already have an account? '}
              <Link
                component="a"
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontSize: { xs: 16, md: 20 },
                }}
                onClick={() => navigate('/login')}
              >
                Sign in
              </Link>
            </Typography>
          </form>
        </Box>
      </Box>
    </Box>
  );
};
export default RegistrationPage;
