import { Box, Typography, CircularProgress } from '@mui/material';
import { fetchAPIRequest } from '../../helpers';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingScreen, Editor } from '../../components';
import SidePanel from './SidePanel';
import TaskActionBtnGroup from './TaskActionBtnGroup';
import TaskProvider from '../../context/TaskSidePanelContext';
import TaskEditorCard from './TaskEditorCard';
import TaskOrderPanel from './TaskOrderPanel';
import { DragDropContext } from 'react-beautiful-dnd';

const TaskEditPage = () => {
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isRearranging, setIsRearranging] = useState(false);
  const [taskContentList, setTaskContentList] = useState([]);
  const [activeCard, setActiveCard] = useState(0);
  useEffect(() => {
    const getTaskDocumentContent = async () => {
      setIsLoading(true);
      const taskContent = await fetchAPIRequest(
        `/task/get/content?projectId=${projectId}`,
        'GET'
      );
      setTaskContentList(taskContent);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    getTaskDocumentContent();
  }, []);

  const setTaskIndex = async (taskId, parentId) => {
    await fetchAPIRequest(
      `/task/set/index?projectId=${projectId}&taskId=${taskId}&parentId=${parentId}`,
      'PUT'
    );
    setIsRearranging(false);
  };

  const handleDragStart = () => {
    setIsRearranging(true);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const items = Array.from(taskContentList);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    console.log(reorderedItem);
    console.log(items[destination.index - 1]);
    destination.index === 0
      ? setTaskIndex(reorderedItem.id, null)
      : setTaskIndex(reorderedItem.id, items[destination.index - 1].id);
    setTaskContentList(items);
  };

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <TaskOrderPanel
          taskList={taskContentList}
          activeCard={activeCard}
          setActiveCard={setActiveCard}
        />
      </DragDropContext>
      <Box
        sx={{
          height: '98vh',
          minWidth: '280px',
        }}
      />
      <TaskProvider>
        <Box
          sx={{ display: 'flex', width: '100%', position: 'relative' }}
          onClick={() => setActiveCard(0)}
        >
          <Box
            sx={{
              py: 4,
              px: 4,
              boxSizing: 'border-box',
              height: 'fit-content',
              width: '100%',
            }}
          >
            <Box
              sx={{
                textAlign: 'left',
                py: 2,
                mb: 2,
              }}
            >
              <Typography
                variant="h1"
                sx={{ fontSize: '30px', fontWeight: 600, mb: 3 }}
              >
                Task Edit
              </Typography>
            </Box>
            {taskContentList.map((task, index) => (
              <TaskEditorCard
                key={task.name.slice(0, 10) + task.id + index}
                name={task.name}
                taskId={task.id}
                taskBlocks={task.blocks}
                index={index}
                activeCard={activeCard}
                setActiveCard={setActiveCard}
                isRearranging={isRearranging}
              />
              // <Box key={index} sx={{ mt: 5 }}>
              //   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              //     <Typography sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
              //       {task.name}
              //     </Typography>
              //     <TaskActionBtnGroup taskId={task.id} />
              //   </Box>
              //   <Editor initialBlocks={task.blocks} taskId={task.id} />
              // </Box>
            ))}
          </Box>
          <SidePanel />
        </Box>
      </TaskProvider>
    </Box>
  );
};
export default TaskEditPage;
