import { Box, Typography } from '@mui/material';
import ConnectionsStatus from './ConnectionsStatus';

const ConnectionsPanel = ({ connectionsData, isLoading }) => {
  return (
    <Box
      sx={{
        // flexGrow: 1,
        // border: '0.5px solid lime',
        borderRadius: 3,
        boxShadow: 3,
        // flexBasis: 'calc(100% / 5)',
        height: '100%',
        // maxHeight: 350,
        boxSizing: 'border-box',
        py: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', px: 2 }}>
        Connections
      </Typography>
      <Box
        sx={{
          overflowX: 'hidden',
          overflowY: 'auto',
          height: '100%',
          maxHeight: 400,
          px: 2,
        }}
      >
        {connectionsData.map((conn) => (
          <ConnectionsStatus
            key={conn.handle}
            name={conn.name}
            image={conn.image}
            handle={conn.handle}
            busyness={conn.busyness}
            isLoading={isLoading}
          />
        ))}
      </Box>
    </Box>
  );
};
export default ConnectionsPanel;
