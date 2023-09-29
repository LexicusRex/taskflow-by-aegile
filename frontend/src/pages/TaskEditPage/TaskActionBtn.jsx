import React, { useState } from 'react';
import { Tooltip, IconButton } from '@mui/material';
import SidePanel from '../../components/SidePanel';
const TaskActionBtn = ({ icon, tooltip, sidebarOff = false }) => {
  const [openPanel, setOpenPanel] = useState(false);
  return (
    <>
      <Tooltip title={tooltip} placement="top">
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            !sidebarOff && setOpenPanel(true);
          }}
          sx={{
            width: 30,
            height: 30,
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>
      <SidePanel isOpen={openPanel} setIsOpen={setOpenPanel} />
    </>
  );
};
export default TaskActionBtn;
