import React, { useContext } from 'react';
import Menu from '@mui/material/Menu';
import Fade from '@mui/material/Fade';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import TeamAddMemberForm from './TeamAddMemberForm';
import AddButton from './AddButton';
import { AlertContext } from '../context/AlertContext';
export default function AddMemberDropDown({
  connections,
  members,
  setMembers,
  title = '',
  desc = '',
}) {
  // Drop down
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const alertCtx = useContext(AlertContext);

  const smartAssign = (allMembers, taskTitle, taskDesc) => {
    const taskWords = `${taskTitle} ${taskDesc}`
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
      .replace(/\s{2,}/g, ' ')
      .split(' ');
    const taskWordsSet = new Set(taskWords);

    const memberMatchCount = {};
    allMembers.forEach((member) => {
      memberMatchCount[member.handle] = { busyness: member.busyness, count: 0 };
    });

    taskWordsSet.forEach((word) => {
      allMembers.forEach((member) => {
        if (word in member.keywords) {
          memberMatchCount[member.handle].count += 1;
        }
      });
    });

    const bestMatches = Object.keys(memberMatchCount)
      .filter(
        (handle) =>
          memberMatchCount[handle].busyness <= 80 &&
          memberMatchCount[handle].count > 0
      )
      .sort(function (a, b) {
        return -(memberMatchCount.count - memberMatchCount.count);
      });

    if (bestMatches.length === 0) {
      alertCtx.info(
        <>
          No matches found.
          <br /> <br />
          Please be more descriptive. <br /> <br /> Your fellow members may also
          be too busy to take on this task.
        </>
      );
    } else {
      // setMembers(bestMatches);
      setMembers(bestMatches.slice(0, 3));
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AddButton onClick={handleClick} />
      <Menu
        id='fade-menu'
        MenuListProps={{
          'aria-labelledby': 'fade-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{
          marginLeft: '2px',
          maxHeight: '450px',
          maxWidth: '600px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 1,
            pb: 1,
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 600, px: 2, py: 1 }}>
            Add Members
          </Typography>
          {!!title && (
            <Tooltip
              title='Click to Smart Assign members that best fit the task requirements.'
              placement='top'
            >
              <Button
                variant='contained'
                onClick={() => smartAssign(connections, title, desc)}
              >
                Smart Assign
              </Button>
            </Tooltip>
          )}
        </Box>
        <TeamAddMemberForm
          fetchMembers={connections}
          selectedMembers={members}
          setMembers={setMembers}
        />
      </Menu>
    </Box>
  );
}
