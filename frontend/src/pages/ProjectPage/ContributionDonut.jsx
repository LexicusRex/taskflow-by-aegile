import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js/auto';
import { Box, Typography } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const ContributionDonut = ({ chartData }) => {
  const firstKey = chartData ? Object.keys(chartData)[0] : '';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          minHeight: 250,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {chartData[firstKey]?.reduce((sum, item) => sum + item.data, 0) <= 0 ? (
          <Typography variant='body1' color='text.secondary'>
            This project has no completed tasks.
          </Typography>
        ) : (
          <Doughnut
            width='100%'
            height='100%'
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const total = context.dataset.data.reduce(
                        (acc, value) => acc + Number(value),
                        0
                      );
                      const value = Number(
                        context.dataset.data[context.dataIndex]
                      );
                      const percentage =
                        ((value / total) * 100).toFixed(0) + '%';
                      return `${context.label}: ${percentage}`;
                    },
                  },
                },
                legend: {
                  padding: '10px',
                  position: 'bottom',
                  labels: {
                    boxWidth: 20,
                    padding: 20,
                  },
                },
              },
            }}
            data={{
              labels: chartData[firstKey]?.map((row) => row.label),
              datasets: [
                {
                  fill: true,
                  data: chartData[firstKey]?.map((row) => row.data),
                  borderColor: ['rgb(135, 124, 228)', 'rgb(129, 148, 173)'],
                  backgroundColor: [
                    'rgba(135, 124, 228, 0.3)',
                    'rgba(129, 148, 173, 0.3)',
                  ],
                  borderWidth: 1,
                },
              ],
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default ContributionDonut;
