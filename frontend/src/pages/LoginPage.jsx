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
import { ReactComponent as Logo } from '../assets/Taskflow-logo-centre.svg';
import { AlertContext } from '../context/AlertContext';

const EMAIL_REGEX = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

const RegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // const [errorMessage, setErrorMessage] = useState('');

  const [email, setEmail] = useState('');
  const [isValidEmail, setValidEmail] = useState(false);
  const [isEmailFocus, setEmailFocus] = useState(false);

  const [password, setPassword] = useState('');
  const [isRememberLogin, setIsRememberLogin] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate(from, { replace: true });
    }
  }, [from, navigate]);

  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  const alertCtx = useContext(AlertContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await fetchAPIRequest('/auth/login', 'POST', {
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
      />
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
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <Logo style={{ width: 400 }} />
          <Typography variant="h3" sx={{ mb: 1 }}>
            Sign In
          </Typography>
          <Typography
            variant="h6"
            fontSize="20"
            color="text.secondary"
            sx={{ textWrap: 'balance' }}
          >
            Welcome back! Please enter your login credentials.
          </Typography>
          <form
            style={{
              width: '100%',
              height: 480,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-evenly',
            }}
            onSubmit={handleSubmit}
          >
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
            <Box>
              <TextField
                variant="standard"
                label="Password"
                type="password"
                fullWidth
                required
                placeholder="••••••••••"
                onChange={(event) => setPassword(event.target.value)}
              />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3,
                }}
              >
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox />}
                    onClick={() => setIsRememberLogin(!isRememberLogin)}
                    label={
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: { xs: 16, md: 20 } }}
                      >
                        Remember me
                      </Typography>
                    }
                    sx={{ textAlign: 'left' }}
                  />
                </FormGroup>
                <Link
                  sx={{
                    textAlign: 'left',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: { xs: 16, md: 20 },
                  }}
                  onClick={() => navigate('/reset-password')}
                >
                  Forgot Password?
                </Link>
              </Box>
            </Box>
            <Button
              type="submit"
              variant="contained"
              disabled={!!(!isValidEmail || !email || !password)}
              sx={{
                textTransform: 'none',
                fontSize: 20,
                width: '100%',
                mb: 2,
                borderRadius: '10px',
              }}
            >
              Log In
            </Button>
            <Typography color="text.secondary" sx={{ textWrap: 'balance' }}>
              {"Don't have an account? "}
              <Link
                // variant="body2"
                component="a"
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'none',
                  // fontSize: { xs: 16, md: 20 },
                }}
                onClick={() => navigate('/register')}
              >
                Sign up here
              </Link>
            </Typography>
          </form>
        </Box>
      </Box>
    </Box>
  );
};
export default RegistrationPage;
