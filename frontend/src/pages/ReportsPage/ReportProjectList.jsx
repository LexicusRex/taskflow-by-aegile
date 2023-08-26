import { Box, Typography, Divider } from '@mui/material';
import ReportProjectItem from './ReportProjectItem';

const parseStatus = (status) => {
  if (status === 'notstarted') return 'not started';
  if (status === 'inprogress') return 'in progress';
  return status;
};

const ReportProjectList = ({ tasksData, isLoading }) => {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 450,
        borderRadius: 3,
        boxShadow: 3,
        boxSizing: 'border-box',
        p: 2,
        mb: 5,
      }}
    >
      <ReportProjectItem
        project='Project Name'
        taskName='Task Name'
        priority='Priority'
        workload='Workload'
        deadline='Due Date'
        status='Status'
        isHeader
      />
      <Divider sx={{ my: 2 }} />
      {tasksData.length === 0 && (
        <Typography color='text.secondary' sx={{ p: 1 }}>
          No tasks yet... Start by creating some!
        </Typography>
      )}
      <Box sx={{ color: 'grey', maxHeight: 300, overflowY: 'auto' }}>
        {tasksData.map((task) => (
          <ReportProjectItem
            projectId={task.id}
            project={task.project}
            taskName={task.task}
            priority={task.priority}
            workload={task.workload}
            deadline={task.deadline === 'Invalid Date' ? 'N/A' : task.deadline}
            status={parseStatus(task.status)}
            isLoading={isLoading}
          />
        ))}
      </Box>
    </Box>
  );
};
export default ReportProjectList;
