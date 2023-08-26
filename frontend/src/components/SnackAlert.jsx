import { useContext, useEffect } from 'react';
import { AlertContext } from '../context/AlertContext';
import { fetchAPIRequest } from '../helpers';

const SnackAlert = ({ isLoggedIn, setNotificationStatus }) => {
  const alertCtx = useContext(AlertContext);
  useEffect(() => {
    const getNotifications = async () => {
      try {
        const notifications = await fetchAPIRequest('/notifications', 'GET');
        if (notifications.length !== 0) {
          localStorage.setItem('notification_status', 'error');
          setNotificationStatus('error');
        }
        notifications.forEach((notification) => {
          alertCtx.notify(notification);
        });
      } catch (err) {
        err.message === 'Failed to fetch'
          ? alertCtx.error('Disconnected from server')
          : alertCtx.error(err.message);
        if (err.message === 'Invalid token') {
          localStorage.removeItem('token');
          localStorage.removeItem('notification_status');
          // window.location.reload(false);
        }
      }
    };

    const interval = setInterval(() => {
      isLoggedIn && getNotifications();
    }, 2000);
    return () => clearInterval(interval);
  }, [alertCtx, isLoggedIn, setNotificationStatus]);

  return <></>;
};
export default SnackAlert;
