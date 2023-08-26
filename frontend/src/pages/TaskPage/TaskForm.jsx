import {
  Box,
  Divider,
  TextField,
  Button,
  Typography,
  Avatar,
  AvatarGroup,
  IconButton,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { FetchBtn } from '../../components';
import PrioritySelecter from './PrioritySelecter';
import AddMemberDropDown from '../../components/AddMemberDropDown';
import ClearIcon from '@mui/icons-material/Clear';

// Date picker imports
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Drop down
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

// Slider
import Slider from '@mui/material/Slider';
import { useParams } from 'react-router-dom';

import ConfirmDialog from '../../components/ConfirmDialog';
import FileUploadBtn from '../../components/FileUploadBtn';
import Link from '@mui/material/Link';
import { fetchAPIRequest } from '../../helpers';

// Comment import
import Comment from './Comment';
import SendIcon from '@mui/icons-material/Send';

const TaskForm = ({
  toggleModal,
  purpose,
  taskStatus,
  taskData,
  setIsEdit,
}) => {
  const { projectId } = useParams();
  let editDate = null;
  if (purpose === 'edit') {
    const breakDown = taskData.deadline.split('/');
    editDate = `${breakDown[2]}, ${breakDown[1]}, ${breakDown[0]}`;
  }
  // Input fields
  const [taskName, setTaskName] = useState(
    purpose === 'edit' ? taskData.name : ''
  );
  const [taskFocus, setTaskFocus] = useState(false);
  const [description, setDescription] = useState(
    purpose === 'edit' ? taskData.description : ''
  );
  const [date, setDate] = useState(purpose === 'edit' ? dayjs(editDate) : null);
  const [workLoad, setWorkLoad] = useState(
    purpose === 'edit' ? taskData.weighting : 0
  );
  const [priority, setPriority] = useState(
    purpose === 'edit' ? taskData.priority : null
  );

  // Drop down
  const [status, setStatus] = useState(
    purpose === 'edit' ? taskData.status : taskStatus
  );
  const [members, setMembers] = useState(
    purpose === 'edit' ? taskData.assignees : []
  );
  const [connections, setConnections] = useState({});

  const [comment, setComment] = useState('');
  const [commentList, setCommentList] = useState([]);

  const [attachment, setAttachment] = useState(
    purpose === 'edit' ? taskData.attachment : null
  );
  const [attachmentName, setAttachmentName] = useState(
    purpose === 'edit' ? taskData.attachmentName : null
  );
  const [currAttachment, setCurrAttachment] = useState(
    purpose === 'edit' ? taskData.attachment : null
  );
  const [currAttachmentName, setCurrAttachmentName] = useState(
    purpose === 'edit' ? taskData.attachmentName : null
  );

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };
  // Rendering of comments
  const [isHovered, setIsHovered] = useState(false);
  const [isNewComment, setIsNewComment] = useState(false);

  // Auto scroll to the bottom
  const scrollRef = useRef(null);

  // Handle reply
  const [replyStatus, setReplyStatus] = useState(false);
  const [replyHandle, setReplyHandle] = useState(null);
  const [replyId, setReplyId] = useState(null);

  const handleReply = (handler, replyCommentId) => {
    setReplyHandle(handler);
    setReplyStatus(true);
    setReplyId(replyCommentId);
  };

  // Scroll useEffect
  useEffect(() => {
    if (scrollRef.current && isHovered) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  }, [isHovered]);

  useEffect(() => {
    const getConnections = async () => {
      const connections = await fetchAPIRequest(
        `/connections/task?projectId=${projectId}`,
        'GET'
      );
      setConnections(connections);
      purpose !== 'edit' && setMembers([Object.keys(connections)[0]]);
    };

    const renderComments = async () => {
      await fetchAPIRequest(
        `/task/get/comment?taskId=${taskData?.id}`,
        'GET'
      ).then((response) => {
        const comList = [];
        for (const comment of response) {
          comList.push(
            <Comment
              key={comment.id}
              id={comment.id}
              text={comment.text}
              sender={comment.poster}
              time={comment.time}
              replyHandle={comment.replyHandle}
              replyText={comment.replyText}
              reply={comment.reply}
              handleReply={handleReply}
            />
          );
        }
        setCommentList(comList);
      });
    };

    renderComments();
    getConnections();
  }, [projectId, purpose, taskData, isNewComment]);

  useEffect(() => {
    members &&
      Object.keys(connections).length > 0 &&
      members.forEach((member) => {
        connections[member].assigned = true;
      });
  }, [connections, members]);

  return (
    <Box>
      <Box sx={{ display: 'flex' }}>
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Task Details
          </Typography>
        </Box>
        <Box
          sx={{
            marginLeft: 'auto',
            display: purpose === 'edit' ? 'block' : 'none',
          }}
        >
          <ConfirmDialog
            taskId={purpose === 'edit' ? taskData.id : null}
            toggleModal={toggleModal}
            render={purpose === 'edit' ? setIsEdit : null}
          />
        </Box>
      </Box>
      <TextField
        fullWidth
        sx={{ mb: 1 }}
        rows={2}
        variant="outlined"
        required
        label="Task Name"
        value={taskName}
        onChange={(event) => setTaskName(event.target.value)}
        error={!taskName && taskFocus}
        helperText={!taskName && taskFocus && '⚠️ Task must have a name!'}
        onFocus={() => setTaskFocus(true)}
        onBlur={() => setTaskFocus(false)}
      />
      {/* Status and deadline */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ width: '50%', paddingTop: '8px' }}>
          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={status} onChange={handleStatusChange}>
              <MenuItem value={'blocked'}>Blocked</MenuItem>
              <MenuItem value={'notstarted'}>Not Started</MenuItem>
              <MenuItem value={'inprogress'}>In Progress</MenuItem>
              <MenuItem value={'completed'}>Completed</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: '50%' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                label="Deadline"
                value={date !== 'Invalid Date' ? date : null}
                onChange={(event) => setDate(event)}
                format="DD/MM/YYYY"
                disablePast
              />
            </DemoContainer>
          </LocalizationProvider>
        </Box>
      </Box>
      {/* Priority and Weighting */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
        }}
      >
        {/* Slider */}
        <Box sx={{ width: '50%' }}>
          <InputLabel>Work Load</InputLabel>
          <Box
            sx={{
              maxWidth: '300px',
              minWidth: '100px',
              display: 'flex',
              gap: 2,
              px: 2,
              mt: '4px',
            }}
          >
            <Slider
              defaultValue={50}
              aria-label="Default"
              valueLabelDisplay="auto"
              value={workLoad}
              min={0}
              max={5}
              step={1}
              marks
              onChange={(event) => setWorkLoad(event.target.value)}
            />
            {/* Weight display */}
            <Box sx={{ my: 'auto', border: '0.5px solid #776E6E', px: '8px' }}>
              {workLoad}
            </Box>
          </Box>
        </Box>
        {/* Priority */}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
          <InputLabel>Priority *</InputLabel>
          <PrioritySelecter priority={priority} setPriority={setPriority} />
        </Box>
      </Box>
      <TextField
        fullWidth
        multiline
        sx={{ mb: 2 }}
        rows={2}
        variant="outlined"
        label="Description"
        value={description}
        placeholder="This project consists of..."
        onChange={(event) => setDescription(event.target.value)}
      />
      {/* Members */}
      <Box>
        <InputLabel>Members</InputLabel>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ mb: 2 }}>
            {/* Members section */}
            <Box sx={{ display: 'flex', ml: 2 }}>
              {/* Member icons */}
              <AvatarGroup max={4} sx={{ mr: '5px' }}>
                {members.map((member, index) => {
                  return (
                    <Avatar
                      key={`avatar-${member}-${index}`}
                      // key={connections[member]?.name + index}
                      alt={connections[member]?.name}
                      src={connections[member]?.image}
                      sx={{ ml: -2 }}
                    >
                      {connections[member]?.name}
                    </Avatar>
                  );
                })}
              </AvatarGroup>
              <Box
                sx={{
                  '&:hover': { cursor: 'pointer' },
                  margin: 'auto',
                }}
              >
                <AddMemberDropDown
                  connections={Object.values(connections)}
                  members={members}
                  setMembers={setMembers}
                  title={taskName}
                  desc={description}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* Attachments */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
        <InputLabel>Attachments</InputLabel>
        {currAttachment && (
          <Box>
            <Link
              href={currAttachment}
              download={currAttachmentName}
              sx={{ mb: 1 }}
            >
              {currAttachmentName}
            </Link>

            <IconButton
              onClick={() => {
                setCurrAttachment(null);
                setCurrAttachmentName(null);
                setAttachment(null);
                setAttachmentName(null);
              }}
              sx={{ ml: 'auto' }}
            >
              <ClearIcon />
            </IconButton>
          </Box>
        )}

        <FileUploadBtn
          btnText="Attachment"
          fileCallback={setAttachment}
          filenameCallback={setAttachmentName}
        />
      </Box>
      {/* Comments */}
      {purpose === 'edit' && (
        <Box>
          <InputLabel>Comments</InputLabel>
          <Box
            sx={{
              my: '5px',
              paddingLeft: '5px',
              maxHeight: '250px',
              overflow: 'auto',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {commentList}
            <Box ref={scrollRef}></Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              id="standard-basic"
              label={
                replyStatus ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography>Replying to @{replyHandle}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setReplyStatus(false);
                        setComment('');
                      }}
                    >
                      <ClearIcon
                        size="small"
                        sx={{
                          width: '20px',
                          height: '20px',
                        }}
                      />
                    </IconButton>
                  </Box>
                ) : (
                  'Write a comment...'
                )
              }
              variant="standard"
              sx={{
                ml: 1,
                width: '500px',
                my: 'auto',
              }}
              onChange={(event) => setComment(event.target.value)}
              value={comment}
              focused={replyStatus}
            />
            {/* Send icon */}
            <SendIcon
              onClick={async () => {
                const idReply = replyStatus === true ? replyId : -1;
                if (comment.length !== 0) {
                  await fetchAPIRequest('/task/comment', 'POST', {
                    taskId: taskData.id,
                    text: comment,
                    repliedCommentId: idReply,
                  })
                    .then(() => {
                      setComment('');
                      setReplyStatus(false);
                      setIsNewComment((prev) => !prev);
                    })
                    .then(() => {
                      setTimeout(() => {
                        scrollRef.current.scrollIntoView({
                          behavior: 'smooth',
                        });
                      }, 200);
                    });
                }
              }}
              sx={{
                color: '#a8a8a8',
                my: 'auto',
                mt: '35px',
                '&:hover': {
                  color: comment.length === 0 ? '#a8a8a8' : '#8378e3',
                  cursor: comment.length === 0 ? 'not-allowed' : 'pointer',
                },
              }}
            />
          </Box>
        </Box>
      )}
      <Divider sx={{ my: 3 }} />
      {/* Bottom Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <FetchBtn
          btnText={purpose === 'edit' ? 'Save Changes' : 'Create Task'}
          isDisabled={!taskName || !priority}
          variant="contained"
          isFullWidth
          styles={{
            borderRadius: '10px',
            textTransform: 'none',
            fontSize: 20,
            mr: 1,
          }}
          route={purpose === 'edit' ? '/task/update/specs' : '/task/create'}
          method={purpose === 'edit' ? 'PUT' : 'POST'}
          bodyData={
            purpose === 'edit'
              ? {
                  project_id: projectId,
                  task_id: taskData.id,
                  name: taskName,
                  description: description,
                  deadline: dayjs(date).format('DD/MM/YYYY'),
                  status: status,
                  attachment: attachment,
                  attachment_name: attachmentName,
                  weighting: workLoad,
                  priority: priority,
                  assignees: members,
                }
              : {
                  project_id: projectId,
                  name: taskName,
                  description: description,
                  deadline: dayjs(date).format('DD/MM/YYYY'),
                  status: status,
                  attachment: attachment,
                  attachment_name: attachmentName,
                  weighting: workLoad,
                  priority: priority,
                  assignees: members,
                }
          }
          toggleModal={toggleModal}
          setIsEdit={setIsEdit}
        />
        <Button
          color="primary"
          fullWidth
          variant="outlined"
          onClick={() => {
            toggleModal();
          }}
          margin="dense"
          sx={{ ml: 1, borderRadius: '10px' }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};
export default TaskForm;
