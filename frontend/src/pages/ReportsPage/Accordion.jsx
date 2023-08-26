import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/material';

export default function ControlledAccordions({ reportData, index }) {
  const getHandle = () => {
    const notHandle = [
      'daily_proj_completed',
      'overall_evaluation',
      'tasks_completed',
      'timestamp',
    ];
    for (const key in reportData) {
      if (!notHandle.includes(key)) {
        return key;
      }
    }
  };
  let handle = getHandle();

  const [expanded, setExpanded] = useState(index === 0);

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
        <AccordionDetails onClick={(e) => e.stopPropagation()}>
          <Typography sx={{ fontSize: '15px', fontWeight: 500 }}>
            Daily Project Completion:
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography color="text.secondary">
              Average: {reportData?.daily_tasks_completed?.average}
            </Typography>
            <Typography color="text.secondary">
              Trend: {reportData?.daily_tasks_completed?.trend}
            </Typography>
          </Box>
          <Typography sx={{ mb: 2 }}>
            {reportData?.daily_tasks_completed?.comment}
          </Typography>

          <Typography sx={{ fontSize: '15px', fontWeight: 500 }}>
            Your Feedback:
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography color="text.secondary">
              Average: {reportData[handle]?.average}
            </Typography>
            <Typography color="text.secondary">
              Trend: {reportData[handle]?.trend}
            </Typography>
          </Box>
          <Typography sx={{ mb: 2 }}>{reportData[handle]?.comment}</Typography>

          <Typography sx={{ fontSize: '15px', fontWeight: 500 }}>
            Overall Evaluation
          </Typography>
          <Typography sx={{ mb: 2 }}>
            {reportData.overall_evaluation}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
