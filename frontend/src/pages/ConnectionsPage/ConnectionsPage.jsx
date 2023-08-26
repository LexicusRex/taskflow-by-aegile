import { useEffect, useState } from 'react';
import { fetchAPIRequest } from '../../helpers';
import SuggestionsCard from './SuggestionsCard';
import ConnectionCard from './ConnectionCard';
import {
  Box,
  Grid,
  Typography,
  useMediaQuery,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { LoadingScreen } from '../../components';

const UserProfilePage = () => {
  const [myConnections, setMyConnections] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isMatch = useMediaQuery('(max-width:1800px)');

  useEffect(() => {
    setIsLoading(true);
    const fetchConnections = async () => {
      try {
        const connections = await fetchAPIRequest('/connections', 'GET');
        setMyConnections(connections);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchConnections();
  }, [isEdit]);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Box sx={{ pt: 6, px: { xs: 1, sm: 3, md: 4, lg: 5 }, height: 'inherit' }}>
      <Typography
        fontWeight={600}
        sx={{ fontSize: 32, mb: 1, ml: { xs: 0, sm: 2 } }}
      >
        Connections
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          height: '100%',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              ml: 2,
              mt: 3,
            }}
          >
            My Connections
          </Typography>
          <Box
            sx={{
              maxWidth: 1100,
              display: 'flex',
              justifyContent: 'space-evenly',
              alignContent: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {myConnections?.accept?.map((connection, index) => (
              <ConnectionCard
                key={'accept' + index}
                {...connection}
                status="Accept"
                setIsEdit={setIsEdit}
              />
            ))}
            {myConnections?.pending?.map((connection, index) => (
              <ConnectionCard
                key={'pending' + index}
                {...connection}
                status="Pending"
                setIsEdit={setIsEdit}
              />
            ))}
            {myConnections?.connected?.map((connection, index) => (
              <ConnectionCard
                key={'connected' + index}
                {...connection}
                status="Connected"
                setIsEdit={setIsEdit}
              />
            ))}
            {myConnections?.pending?.length +
              myConnections?.accept?.length +
              myConnections?.connected?.length <=
              0 && (
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ ml: 2, flex: 1 }}
              >
                No connections yet... Be the first to connect!
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            mt: 1,
            backgroundColor: 'rgba(236, 239, 241, 0.50)',
            borderRadius: '28px 28px 0 0',
            p: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              mb: 3,
            }}
          >
            Suggested Connections
          </Typography>
          <TextField
            placeholder={'Search'}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: '100%', backgroundColor: '#fff', mb: 2 }}
          />
          <Grid
            sx={{
              maxWidth: { xs: 1100, xl: isMatch ? 1100 : 400 },

              height: 'fit-content',
              boxSizing: 'border-box',
              maxHeight: '69vh',
              overflow: 'auto',

              // position: isMatch && 'relative',
              // top: isMatch && { xs: -120, sm: -180, md: -220, lg: -280 },
            }}
            container
            // spacing={2}
            // spacing={{ xs: 2, md: 3 }}
            columns={1}
          >
            {myConnections?.suggestions?.map((connection, index) => {
              return <Grid
                item
                key={index}
                xs={1}
                sm={1}
                md={1}
                lg={1}
                xl={1}
                sx={{ height: 'fit-content', m: 1, width: '100%' }}
              >
                <SuggestionsCard {...connection} setIsEdit={setIsEdit} />
              </Grid>
})}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};
export default UserProfilePage;
