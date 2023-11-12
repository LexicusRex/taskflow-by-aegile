import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  LoginPage,
  RegistrationPage,
  PasswordResetPage,
  Dashboard,
  ProjectPage,
  UserProfilePage,
  ConnectionsPage,
  TaskPage,
  TaskEditPage,
  PerformancePage,
  ReportsPage,
} from './pages/index.js';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Grid } from '@mui/material';
import { ProtectedRoute, SnackAlert, MenuBar } from './components';
import AlertProvider from './context/AlertContext';
import NotificationBell from './components/NotificationBell';
import { useState } from 'react';
import DocumentPreviewPage from './pages/DocumentPreviewPage/DocumentPreviewPage.jsx';

const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  palette: {
    primary: {
      main: '#8378e3',
      secondary: 'dad7f7',
      darker: '#8378e3',
    },
    muted: {
      main: '#c3bef2',
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [notificationStatus, setNotificationStatus] = useState(
    localStorage.getItem('notification_status')
      ? localStorage.getItem('notification_status')
      : 'default'
  );

  return (
    <BrowserRouter>
      <Grid container>
        {isLoggedIn && (
          <Grid
            item
            sx={{
              width: '250px',
              overflow: 'auto',
              display: {
                '@media (max-width: 1000px)': {
                  width: '70px',
                },
              },
            }}
          >
            <MenuBar setIsLoggedIn={setIsLoggedIn} />
          </Grid>
        )}
        {isLoggedIn && (
          <Box
            sx={{
              width: '2px',
              height: '100vh',
              backgroundColor: '#CACACA',
            }}
          />
        )}
        <Grid
          item
          xs
          sx={{
            overflow: 'auto',
            maxHeight: '100vh',
          }}
        >
          {isLoggedIn && (
            <NotificationBell
              notificationStatus={notificationStatus}
              setNotificationStatus={setNotificationStatus}
            />
          )}
          <ThemeProvider theme={theme}>
            <AlertProvider>
              <SnackAlert
                isLoggedIn={isLoggedIn}
                setNotificationStatus={setNotificationStatus}
              />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/reset-password" element={<PasswordResetPage />} />
                <Route
                  element={<ProtectedRoute setIsLoggedIn={setIsLoggedIn} />}
                >
                  <Route
                    path="/profile"
                    element={<UserProfilePage isAuthUser={isLoggedIn} />}
                  />
                  <Route
                    path="/u/:handle"
                    element={<UserProfilePage isAuthUser={false} />}
                  />
                  <Route path="/connections" element={<ConnectionsPage />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/projects" element={<ProjectPage />} />
                  <Route path="/projects/:projectId" element={<TaskPage />} />
                  <Route path="/performance" element={<PerformancePage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/edit/:projectId" element={<TaskEditPage />} />
                  <Route
                    path="/document/preview/:projectId"
                    element={<DocumentPreviewPage />}
                  />
                </Route>
              </Routes>
            </AlertProvider>
          </ThemeProvider>
        </Grid>
      </Grid>
    </BrowserRouter>
  );
}

export default App;
