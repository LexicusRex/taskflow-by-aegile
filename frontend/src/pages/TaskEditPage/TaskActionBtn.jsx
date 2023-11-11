import { Tooltip, IconButton } from '@mui/material';
const TaskActionBtn = ({ action, icon, tooltip }) => {
  return (
    <>
      <Tooltip title={tooltip} placement="top">
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            action();
          }}
          sx={{
            width: 20,
            height: 20,
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>
    </>
  );
};
export default TaskActionBtn;
