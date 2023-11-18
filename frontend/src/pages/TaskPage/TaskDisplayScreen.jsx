import React, { useEffect, useState, useContext } from 'react';
import { Box } from '@mui/material';
import { fetchAPIRequest } from '../../helpers';
import { useParams } from 'react-router-dom';
import { LoadingScreen, SearchBar } from '../../components';
import { DragDropContext } from 'react-beautiful-dnd';
import TaskList from './TaskList';
import TaskDetails from './TaskDetails';
import TaskPageAnalytics from './TaskPageAnalytics';
import { AlertContext } from '../../context/AlertContext';

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

  const [selectedTask, setSelectedTask] = useState({});
  const [currentSubtasks, setCurrentSubtasks] = useState([]);
  const alertCtx = useContext(AlertContext);

  const handleImageLoad = () => {
    if (loadedImageCount >= 0 && loadedImageCount < taskCount) {
      setLoadedImageCount((prevCount) => prevCount + 1);
    }
  };

  // const filterTasks = (taskList) => {
  //   return taskList.filter((task) => {
  //     let target = task.name;
  //     let query = searchFilter.split('::')[1];
  //     if (searchFilter.startsWith('id::')) {
  //       target = task.id;
  //     } else if (searchFilter.startsWith('desc::')) {
  //       target = task.description;
  //     } else if (searchFilter.startsWith('due::')) {
  //       target = task.deadline;
  //     } else {
  //       query = searchFilter;
  //     }
  //     return target.toString().toLowerCase().includes(query.toLowerCase());
  //   });
  // };

  useEffect(() => {
    if (loadedImageCount >= taskCount && loadedImageCount > 0) {
      setTimeout(() => {
        setAllImagesLoaded(true);
      }, 500);
    }
  }, [loadedImageCount, taskCount]);

  useEffect(() => {
    const fetchAndRenderTasks = async () => {
      setLoadedImageCount(0);
      setAllImagesLoaded(false);
      try {
        let tasks = await fetchAPIRequest(
          `/task/get/all?projectId=${projectId}`,
          'GET'
        );
        const connections = await fetchAPIRequest(
          `/connections/task?projectId=${projectId}`,
          'GET'
        );
        // Render side bar if there is a selected task
        if (Object.keys(selectedTask).length > 0) {
          for (const task of tasks) {
            if (task.id === selectedTask.id) {
              setSelectedTask(task);
              setCurrentSubtasks(task.subtasks);
            }
          }
        }
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
      setIsEdit((prev) => !prev);
    } catch (err) {
      console.log(err);
    }
  };

  const setAsSubtask = async (taskId, parentId) => {
    try {
      await fetchAPIRequest(
        `/task/set/subtask?taskId=${taskId}&parentId=${parentId}`,
        'PUT'
      );
      setIsEdit((prev) => !prev);
    } catch (err) {
      console.log(err);
    }
  };
  const removeAsSubtask = async (taskId, status) => {
    console.log(taskId, status);
    try {
      await fetchAPIRequest(
        `/task/remove/subtask?taskId=${taskId}&status=${status}`,
        'PUT'
      );
      setIsEdit((prev) => !prev);
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
      'subtask-list': {
        state: currentSubtasks,
        update: setCurrentSubtasks,
      },
    };

    const { source, destination } = result;
    if (source.droppableId !== destination.droppableId) {
      // remove from old list
      const sourceList = dropIdToState[source.droppableId].state;
      const [removed] = sourceList.splice(source.index, 1);
      const destList = dropIdToState[destination.droppableId].state;

      if (
        destination.droppableId === 'subtask-list' &&
        removed.id === selectedTask.id
      ) {
        alertCtx.error('Cannot assign a task as a subtask to itself');
        // add back to old list
        sourceList.splice(source.index, 0, removed);
        return;
      }
      if (
        destination.droppableId === 'subtask-list' &&
        removed.subtasks.length > 0
      ) {
        alertCtx.error('Cannot assign a parent task as a subtask.');
        // add back to old list
        sourceList.splice(source.index, 0, removed);
        return;
      }

      // insert into new list
      destList.splice(destination.index, 0, removed);
      dropIdToState[source.droppableId].update(sourceList); // update old list
      dropIdToState[destination.droppableId].update(destList);
      destination.droppableId === 'subtask-list' &&
        setAsSubtask(removed.id, selectedTask.id);
      source.droppableId === 'subtask-list' &&
        removeAsSubtask(
          removed.id,
          dropIdToState[destination.droppableId].status
        );
      if (
        source.droppableId !== 'subtask-list' &&
        destination.droppableId !== 'subtask-list'
      ) {
        updateTaskStatus(
          removed.id,
          dropIdToState[destination.droppableId].status
        );
      }
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
        height: '100dvh',
        // '@media (max-width: 1400px)': {
        //   flexDirection: 'column',
        // },
      }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
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
            <TaskList
              taskList={blocked}
              listId="blocked-tasks"
              labelText="Blocked"
              projectId={projectId}
              projectMembers={projectMembers}
              allImagesLoaded={allImagesLoaded}
              handleImageLoad={handleImageLoad}
              setIsEdit={setIsEdit}
              selectedId={selectedTask.id}
              setSelectedTask={setSelectedTask}
              setCurrentSubtasks={setCurrentSubtasks}
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
              selectedId={selectedTask.id}
              setSelectedTask={setSelectedTask}
              setCurrentSubtasks={setCurrentSubtasks}
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
              selectedId={selectedTask.id}
              setSelectedTask={setSelectedTask}
              setCurrentSubtasks={setCurrentSubtasks}
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
              selectedId={selectedTask.id}
              setSelectedTask={setSelectedTask}
              setCurrentSubtasks={setCurrentSubtasks}
            />
          </Box>
        </Box>
        {Object.keys(selectedTask).length > 0 ? (
          <TaskDetails
            projectId={projectId}
            projectMembers={projectMembers}
            allImagesLoaded={allImagesLoaded}
            handleImageLoad={handleImageLoad}
            setIsEdit={setIsEdit}
            taskData={selectedTask}
            subtasks={currentSubtasks}
            setSelectedTask={setSelectedTask}
            isLoading={!allImagesLoaded}
          />
        ) : (
          <TaskPageAnalytics
            isEdit={isEdit}
            projectId={projectId}
            style={{
              width: '20%',
            }}
          />
        )}
      </DragDropContext>
    </Box>
  );
}
