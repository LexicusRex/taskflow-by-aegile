import { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Divider,
} from '@mui/material';

const UserAccordion = ({ reportData, index }) => {
  const [expanded, setExpanded] = useState(!!(index === 0));

  return (
    <Box sx={{ mb: 1 }}>
      <Accordion
        expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        sx={{ border: '0.5px solid #EAEAEA' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              pr: 1,
            }}
          >
            <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 600 }}>
              Report Generated
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {reportData?.timestamp.replace('T', ' at ')}
            </Typography>
          </Box>
        </AccordionSummary>
        <Divider sx={{ my: 1 }} />
        <AccordionDetails onClick={(e) => e.stopPropagation()}>
          {Object.keys(reportData)
            .filter(
              (key) => key !== 'timestamp' && key !== 'overall_evaluation'
            )
            .map((key) => {
              const title = key.split('_').join(' ');
              return (
                <Box key={key}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {title.charAt(0).toUpperCase() + title.slice(1)}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-evenly',
                      mb: 1,
                    }}
                  >
                    <Typography color="text.secondary">
                      Average: {reportData[key]?.average}
                    </Typography>
                    <Typography color="text.secondary">
                      Trend: {reportData[key]?.trend}
                    </Typography>
                  </Box>
                  <Typography sx={{ mb: 2 }}>
                    {reportData[key]?.comment}
                  </Typography>
                  <Divider sx={{ my: 2, mx: 1 }} />
                </Box>
              );
            })}

          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            Overall Evaluation
          </Typography>
          <Typography sx={{ mb: 2 }}>
            {reportData.overall_evaluation}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
export default UserAccordion;
