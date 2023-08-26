import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { fetchAPIRequest } from '../helpers';

export default function ConfirmDialog({ taskId, toggleModal, render }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const deleteTask = async () => {
    try {
      await fetchAPIRequest(`/task/delete?taskId=${taskId}`, 'DELETE');
    } catch (err) {
      console.log(err);
    }
  };
  const handleConfirm = () => {
    // Need to queue async here for the render to happen, deletion must first occur
    deleteTask().then(() => {
      render((prev) => !prev);
    });
    setOpen(false);
    toggleModal();
  };

  return (
    <div>
      <Button
        color="error"
        startIcon={<DeleteOutlineOutlinedIcon />}
        onClick={handleClickOpen}
      >
        Delete Task
      </Button>
      {/* <DeleteOutlineOutlinedIcon
        onClick={handleClickOpen}
        sx={{ color: '#FF6F6F', '&:hover': { cursor: 'pointer' } }}
      /> */}
      <Box sx={{ display: 'flex' }}>
        <Dialog
          sx={{
            width: '500px',
            height: '450px',
            margin: 'auto',
          }}
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {'Confirm Deletion'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This action cannot be undone!
            </DialogContentText>
          </DialogContent>
          <DialogActions
            sx={{ display: 'flex', flexDirection: 'row', marginX: 'auto' }}
          >
            <Button variant="contained" onClick={handleConfirm} autoFocus>
              Confirm
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
}
