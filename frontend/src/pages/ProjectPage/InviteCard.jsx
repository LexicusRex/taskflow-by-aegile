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
import { useContext, useState } from 'react';
import { AlertContext } from '../../context/AlertContext';
import { fetchAPIRequest } from '../../helpers';
import DoneIcon from '@mui/icons-material/Done';

const InviteCard = ({
  handle,
  image,
  projectId,
  projectName,
  status,
  setIsEdit,
}) => {
  const isMatch = useMediaQuery('(max-width:550px)');
  const [isFetchSuccess, setIsFetchSuccess] = useState(false);
  const alertCtx = useContext(AlertContext);

  const handleDelete = async () => {
    try {
      await fetchAPIRequest('/project/invite', 'DELETE', {
        projectId: projectId,
        handle: handle,
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
        maxWidth: 500,
        display: 'flex',
        flexGrow: 1,
        flexBasis: '30%',
        boxSizing: 'border-box',
        m: 1,
        alignItems: 'center',
        py: 2,
        px: 1,
        borderRadius: 3,
        boxShadow: 3,
        justifyContent: 'space-between',
        border: status !== 'Pending' && '2px solid #978ee3;',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
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

        {status === 'Pending' && (
          <Typography
            sx={{
              ml: 2,
              mr: 2,
              mt: 1,
              mb: 1,
              whiteSpace: 'normal',
              textWrap: 'balance',
            }}
          >
            You invited {handle} to join {projectName}
          </Typography>
        )}
        {status === 'Accept' && (
          <Typography
            sx={{
              ml: 2,
              mr: 2,
              mt: 1,
              mb: 1,
              whiteSpace: 'normal',
              textWrap: 'balance',
            }}
          >
            {handle} invited you to join {projectName}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ width: 100 }}>
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
              route="/project/invite"
              method="PUT"
              bodyData={{ projectId, handle }}
              setIsEdit={setIsEdit}
            />
          )}
        </Box>
        <IconButton sx={{ width: 50, height: 50 }} onClick={handleDelete}>
          {isFetchSuccess ? <DoneIcon /> : <PersonRemoveIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};
export default InviteCard;
