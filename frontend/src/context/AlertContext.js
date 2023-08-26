import { createContext, useState } from 'react';
import { SnackbarProvider, enqueueSnackbar, closeSnackbar } from 'notistack';
import { NotificationAlert } from '../components';

export const AlertContext = createContext({
  title: null,
  text: null,
  error: () => {},
  warning: () => {},
  info: () => {},
  notify: () => {},
  success: () => {},
});
export default function AlertProvider({ children }) {
  const [title, setTitle] = useState(null);
  const [text, setText] = useState(null);

  const setClose = (snackbarId) => {
    return closeSnackbar(snackbarId);
  };

  const success = (text) => {
    // setTitle('Success');
    // setText(text);
    text &&
      enqueueSnackbar(text, {
        variant: 'notification',
        type: 'success',
        setClose,
      });
  };

  const error = (text) => {
    // setTitle('Error');
    // setText(text);
    text &&
      enqueueSnackbar(text, {
        variant: 'notification',
        type: 'error',
        setClose,
      });
  };
  const info = (text) => {
    // setTitle('Info');
    // setText(text);
    text &&
      enqueueSnackbar(text, {
        variant: 'notification',
        type: 'info',
        setClose,
      });
  };
  const notify = (data) => {
    // setTitle('Info');
    // setText(text);
    enqueueSnackbar(`@${data.sender} ${data.message}`, {
      variant: 'notification',
      type: data.type,
      setClose,
    });
  };
  const warning = (text) => {
    // setTitle('Warning');
    // setText(text);
    text &&
      enqueueSnackbar(text, {
        variant: 'notification',
        type: 'warning',
        setClose,
      });
  };

  const clear = () => {
    setTitle(null);
    setText(null);
  };

  return (
    <AlertContext.Provider
      value={{ title, text, error, warning, info, notify, success, clear }}
    >
      <SnackbarProvider
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        Components={{ notification: NotificationAlert }}
      />
      {children}
    </AlertContext.Provider>
  );
}
