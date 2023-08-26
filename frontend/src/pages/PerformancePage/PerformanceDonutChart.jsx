import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js/auto';
import {
  Box,
  MenuItem,
  Select,
  Typography,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

const PerformanceDonutChart = ({
  chartTitle,
  selectionTitle,
  labelTitle,
  chartData,
}) => {
  const [selection, setSelection] = useState(
    chartData ? Object.keys(chartData)[0] : ''
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: 3,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        {chartTitle}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Refreshes every 24 hours
      </Typography>
      <FormControl>
        <InputLabel>{selectionTitle}</InputLabel>
        <Select
          label={selectionTitle}
          value={selection}
          autoWidth
          onChange={(e) => setSelection(e.target.value)}
        >
          {Object.keys(chartData).map((key) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          minHeight: 250,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {chartData[selection]?.reduce((sum, item) => sum + item.data, 0) <=
        0 ? (
          <Typography variant="body1" color="text.secondary">
            This project has no completed tasks.
          </Typography>
        ) : (
          <Doughnut
            width="100%"
            height="100%"
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
            data={{
              labels: chartData[selection]?.map((row) => row.label),
              datasets: [
                {
                  fill: true,
                  label: labelTitle,
                  data: chartData[selection]?.map((row) => row.data),
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
export default PerformanceDonutChart;
