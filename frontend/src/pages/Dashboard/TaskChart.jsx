import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js/auto';
import { Box, Typography } from '@mui/material';
ChartJS.register(ArcElement, Tooltip, Legend);

const TaskChart = ({ chartData }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: 3,
        height: '100%',
        boxSizing: 'border-box',
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
        Daily Task Completion
      </Typography>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          maxHeight: { xs: 400, xl: 200 },
          minHeight: 200,
          alignItems: 'center',
        }}
      >
        <Line
          width="100%"
          height="100%"
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                title: {
                  display: true,
                  text: 'Tasks',
                },
                ticks: {
                  precision: 0,
                },
                min: 0,
                grace: '5%',
              },
              x: {
                title: {
                  display: true,
                  text: 'Dates',
                },
              },
            },
          }}
          data={{
            labels: chartData.map((row) => row.date),
            datasets: [
              {
                fill: true,
                label: 'Task Completions',
                data: chartData.map((row) => row.count),
                borderColor: 'rgb(135, 124, 228)',
                backgroundColor: 'rgba(135, 124, 228, 0.3)',
                lineTension: 0.4,
              },
            ],
          }}
        />
      </Box>
    </Box>
  );
};
export default TaskChart;
