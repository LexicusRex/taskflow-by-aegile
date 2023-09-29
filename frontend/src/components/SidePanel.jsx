import { Box } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';

const SidePanel = ({ isOpen, setIsOpen }) => {
  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <Box
        sx={{
          width: '400px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          right: 0,
          transform: !isOpen && 'translateX(110%)',
          transition: 'transform 0.3s ease-in-out',
          background: '#fff',
          boxShadow: 3,
          zIndex: 2,
        }}
      />
    </ClickAwayListener>
  );
};
export default SidePanel;
