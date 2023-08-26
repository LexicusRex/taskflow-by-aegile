import { Button } from '@mui/material';
import { useContext, useState, useEffect } from 'react';
import { AlertContext } from '../context/AlertContext';
import { fetchAPIRequest } from '../helpers';
import DoneIcon from '@mui/icons-material/Done';

const FetchBtn = ({
  btnText,
  isDisabled,
  isFullWidth,
  variant,
  route,
  method,
  bodyData,
  styles,
  btnIcon = '',
  size = '',
  isReload = true,
  toggleModal,
  setIsEdit,
  notificationMsg,
  setIsEditState,
}) => {
  const [isFetchSuccess, setIsFetchSuccess] = useState(false);
  const [btnLock, setBtnLock] = useState(false);

  const alertCtx = useContext(AlertContext);
  const handleClick = async () => {
    try {
      const data = await fetchAPIRequest(route, method, bodyData);
      setIsFetchSuccess(true);
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      toggleModal && toggleModal();
      setIsEditState && setIsEditState(false);
      setTimeout(() => {
        setIsEdit((prevState) => !prevState);
      }, 1000);
      notificationMsg && alertCtx.success(notificationMsg);
      setBtnLock(false);
    } catch (err) {
      alertCtx.error(err.message);
    }
  };

  useEffect(() => {
    setIsFetchSuccess(false);
  }, [bodyData]);

  return (
    <Button
      size={size}
      variant={variant}
      color={isFetchSuccess ? 'success' : 'primary'}
      fullWidth={isFullWidth}
      disabled={isDisabled || btnLock}
      startIcon={isFetchSuccess ? <DoneIcon /> : btnIcon}
      onClick={() => {
        if (btnLock) return;
        setBtnLock(true);
        handleClick();
      }}
      sx={styles}
    >
      {isFetchSuccess ? 'Success' : btnText}
    </Button>
  );
};
export default FetchBtn;
