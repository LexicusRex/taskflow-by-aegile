import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import StatusLabel from './StatusLabel';
import TaskCard from './TaskCard';
import { fetchAPIRequest } from '../../helpers';
import { useParams } from 'react-router-dom';
import { LoadingScreen, SearchBar } from '../../components';

export default function TaskDisplayScreen({ isEdit, setIsEdit }) {
  const { projectId } = useParams();
  const [blocked, setBlocked] = useState([]);
  const [notStarted, setNotStarted] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskCount, setTaskCount] = useState(0);

  const [projectMembers, setProjectMembers] = useState([]);

  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadedImageCount, setLoadedImageCount] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');

  const handleImageLoad = () => {
    if (loadedImageCount >= 0 && loadedImageCount < taskCount) {
      setLoadedImageCount((prevCount) => prevCount + 1);
    }
  };

  const filterTasks = (taskList) => {
    return taskList.filter((task) => {
      let target = task.name;
      let query = searchFilter.split('::')[1];
      if (searchFilter.startsWith('id::')) {
        target = task.id;
      } else if (searchFilter.startsWith('desc::')) {
        target = task.description;
      } else if (searchFilter.startsWith('due::')) {
        target = task.deadline;
      } else {
        query = searchFilter;
      }
      return target.toString().toLowerCase().includes(query.toLowerCase());
    });
  };

  // Render function
  const renderTaskList = (taskList) => {
    return taskList.map((task) => (
      <TaskCard
        key={task.id}
        id={task.id}
        projectId={projectId}
        name={task.name}
        description={task.description}
        deadline={task.deadline}
        status={task.status}
        attachment={task.attachment}
        attachmentName={task.attachmentName}
        weighting={task.weighting}
        priority={task.priority}
        assignees={task.assignees}
        assigneesData={projectMembers}
        setIsEdit={setIsEdit}
        isLoading={!allImagesLoaded}
        incrementLoadedCount={handleImageLoad}
        isTaskPage={true}
      />
    ));
  };
  // Fetch and render

  useEffect(() => {
    if (loadedImageCount >= taskCount && loadedImageCount > 0) {
      setTimeout(() => {
        setAllImagesLoaded(true);
      }, 500);
    }
  }, [loadedImageCount, taskCount]);

  // Status style
  const statColStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };

  useEffect(() => {
    const fetchAndRenderTasks = async () => {
      setLoadedImageCount(0);
      setAllImagesLoaded(false);
      try {
        let tasks = await fetchAPIRequest(
          `/task/get?projectId=${projectId}`,
          'GET'
        );
        const connections = await fetchAPIRequest(
          `/connections/task?projectId=${projectId}`,
          'GET'
        );
        setProjectMembers(connections);
        const blockedList = [];
        const notStartedList = [];
        const inProgressList = [];
        const completedList = [];
        // Allocate correct task to correct list
        for (const element of tasks) {
          if (element.status === 'blocked') {
            blockedList.push(element);
          } else if (element.status === 'notstarted') {
            notStartedList.push(element);
          } else if (element.status === 'inprogress') {
            inProgressList.push(element);
          } else {
            completedList.push(element);
          }
        }
        // Render everything
        setTaskCount(tasks.length);
        setBlocked(blockedList);
        setNotStarted(notStartedList);
        setInProgress(inProgressList);
        setCompleted(completedList);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAndRenderTasks();
  }, [isEdit, projectId]);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ECEFF1',
        flexGrow: 1,
        minHeight: '50vh',
        maxHeight: '80vh',
        overflow: 'auto',
        px: 2,
        py: 2,
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        // flex: 6,
      }}
    >
      <SearchBar
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
      />

      <Box
        sx={{
          display: 'flex',
          flex: 6,
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Backlog */}
        <Box sx={statColStyle}>
          <StatusLabel status={'Blocked'} setIsEdit={setIsEdit} />
          {renderTaskList(searchFilter ? filterTasks(blocked) : blocked)}
        </Box>
        {/* Not Started */}
        <Box sx={statColStyle}>
          <StatusLabel status={'Not Started'} setIsEdit={setIsEdit} />
          {renderTaskList(searchFilter ? filterTasks(notStarted) : notStarted)}
        </Box>
        {/* In Progress */}
        <Box sx={statColStyle}>
          <StatusLabel status={'In Progress'} setIsEdit={setIsEdit} />
          {renderTaskList(searchFilter ? filterTasks(inProgress) : inProgress)}
        </Box>
        {/* Completed */}
        <Box sx={statColStyle}>
          <StatusLabel status={'Completed'} setIsEdit={setIsEdit} />
          {renderTaskList(searchFilter ? filterTasks(completed) : completed)}
        </Box>
      </Box>
    </Box>
  );
}
