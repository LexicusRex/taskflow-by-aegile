import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { FetchBtn } from '../../components';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AlertContext } from '../../context/AlertContext';
import { fetchAPIRequest } from '../../helpers';
import DoneIcon from '@mui/icons-material/Done';

const ConnectionCard = ({ handle, name, image, status, setIsEdit }) => {
  const isMatch = useMediaQuery('(max-width:475px)');
  const [isFetchSuccess, setIsFetchSuccess] = useState(false);
  const alertCtx = useContext(AlertContext);

  const handleDisconnect = async () => {
    try {
      await fetchAPIRequest('/connections', 'DELETE', {
        target: handle,
      });
      setIsFetchSuccess(true);
      setTimeout(() => {
        setIsEdit((prevState) => !prevState);
      }, 1000);
    } catch (err) {
      alertCtx.error(err.message);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        maxHeight: 100,
        boxSizing: 'border-box',
        m: 1,
        alignItems: 'center',
        py: 2,
        px: 1,
        borderRadius: 3,
        boxShadow: 3,
        justifyContent: 'space-between',
        border: status !== 'Connected' && '2px solid #978ee3;',
      }}
    >
      <Box
        sx={{
          width: isMatch ? 200 : 275,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {!isMatch && (
          <Box
            component="img"
            src={image ? image : 'https://unsplash.it/50/50'}
            alt="user-profile"
            sx={{ borderRadius: '50%', ml: 2, width: 50, height: 50 }}
          />
        )}
        <Typography
          sx={{
            ml: 2,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          <Link
            to={`/u/${handle}`}
            style={{ color: '#000', textDecoration: 'none' }}
          >
            {name}
          </Link>
        </Typography>
      </Box>
      <Box
        sx={{
          width: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ width: 50 }}>
          {status === 'Pending' && (
            <Button size="small" startIcon={<PendingIcon />}>
              Pending
            </Button>
          )}
          {status === 'Accept' && (
            <FetchBtn
              btnText={status}
              btnIcon={<CheckCircleIcon />}
              variant="contained"
              size="small"
              route="/connections"
              method="PUT"
              bodyData={{ handle }}
              setIsEdit={setIsEdit}
            />
          )}
        </Box>
        <IconButton sx={{ width: 50, height: 50 }} onClick={handleDisconnect}>
          {isFetchSuccess ? <DoneIcon /> : <PersonRemoveIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};
export default ConnectionCard;
