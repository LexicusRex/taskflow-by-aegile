import { Box, Typography } from '@mui/material';
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
  const [taskContentList, setTaskContentList] = useState([]);

  useEffect(() => {
    const getDashboard = async () => {
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

    getDashboard();
  }, []);

  const setTaskIndex = async (taskId, parentId) => {
    await fetchAPIRequest(
      `/task/set/index?projectId=${projectId}&taskId=${taskId}&parentId=${parentId}`,
      'PUT'
    );
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
    <Box sx={{ width: '100%', border: '1px solid red', position: 'relative' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <TaskOrderPanel taskList={taskContentList} />
        <TaskProvider>
          <Box sx={{ display: 'flex' }}>
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
      </DragDropContext>
    </Box>
  );
};
export default TaskEditPage;
