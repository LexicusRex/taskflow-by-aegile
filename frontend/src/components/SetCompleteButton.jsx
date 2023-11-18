import { IconButton, Tooltip } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import { useState, useContext } from 'react';
import { AlertContext } from '../context/AlertContext';
import { fetchAPIRequest } from '../helpers';

const SetCompleteButton = ({ id, update, isVisible = true }) => {
  const alertCtx = useContext(AlertContext);
  const [btnLock, setBtnLock] = useState(false);

  const setCompleted = async () => {
    try {
      await fetchAPIRequest(
        `/task/update/status?taskId=${id}&status=completed`,
        'PUT'
      );
      update();
      alertCtx.success('Task successfully completed!');
      setBtnLock(false);
    } catch (err) {
      console.log(err);
      alertCtx.error(err.message);
    }
  };

  return (
    <Tooltip title="Complete task" placement="top">
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          if (btnLock) return;
          setBtnLock(true);
          setCompleted();
        }}
        sx={{
          width: 30,
          height: 30,
          transition: 'all 0.3s ease-in-out',
          visibility: isVisible ? 'visible' : 'hidden',
          opacity: isVisible ? 1 : 0,
        }}
      >
        <DoneIcon />
      </IconButton>
    </Tooltip>
  );
};
export default SetCompleteButton;
