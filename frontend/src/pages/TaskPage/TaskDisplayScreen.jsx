import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import StatusLabel from './StatusLabel';
import TaskCard from './TaskCard';
import { fetchAPIRequest } from '../../helpers';
import { useParams } from 'react-router-dom';
import { LoadingScreen, SearchBar } from '../../components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskList from './TaskList';

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
    return taskList.map((task, index) => (
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
        index={index}
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

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await fetchAPIRequest(
        `/task/update/status?taskId=${taskId}&status=${newStatus}`,
        'PUT'
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const dropIdToState = {
      'blocked-tasks': {
        state: blocked,
        update: setBlocked,
        status: 'blocked',
      },
      'pending-tasks': {
        state: notStarted,
        update: setNotStarted,
        status: 'notstarted',
      },
      'in-progress-tasks': {
        state: inProgress,
        update: setInProgress,
        status: 'inprogress',
      },
      'completed-tasks': {
        state: completed,
        update: setCompleted,
        status: 'completed',
      },
    };

    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) {
      // remove from old list
      const sourceList = dropIdToState[source.droppableId].state;
      const [removed] = sourceList.splice(source.index, 1);
      const destList = dropIdToState[destination.droppableId].state;
      // insert into new list
      destList.splice(destination.index, 0, removed);
      dropIdToState[source.droppableId].update(sourceList); // update old list
      dropIdToState[destination.droppableId].update(destList);
      updateTaskStatus(
        removed.id,
        dropIdToState[destination.droppableId].status
      );
    } else {
      const sourceList = dropIdToState[source.droppableId].state;
      const items = Array.from(sourceList);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      dropIdToState[source.droppableId].update(items);
    }
  };

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
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Backlog */}
          <TaskList
            taskList={blocked}
            listId="blocked-tasks"
            labelText="Blocked"
            projectId={projectId}
            projectMembers={projectMembers}
            allImagesLoaded={allImagesLoaded}
            handleImageLoad={handleImageLoad}
            setIsEdit={setIsEdit}
          />
          {/* Not Started */}
          <TaskList
            taskList={notStarted}
            listId="pending-tasks"
            labelText="Not Started"
            projectId={projectId}
            projectMembers={projectMembers}
            allImagesLoaded={allImagesLoaded}
            handleImageLoad={handleImageLoad}
            setIsEdit={setIsEdit}
          />
          {/* In Progress */}
          <TaskList
            taskList={inProgress}
            listId="in-progress-tasks"
            labelText="In Progress"
            projectId={projectId}
            projectMembers={projectMembers}
            allImagesLoaded={allImagesLoaded}
            handleImageLoad={handleImageLoad}
            setIsEdit={setIsEdit}
          />
          {/* Completed */}
          <TaskList
            taskList={completed}
            listId="completed-tasks"
            labelText="Completed"
            projectId={projectId}
            projectMembers={projectMembers}
            allImagesLoaded={allImagesLoaded}
            handleImageLoad={handleImageLoad}
            setIsEdit={setIsEdit}
          />
        </DragDropContext>
      </Box>
    </Box>
  );
}
