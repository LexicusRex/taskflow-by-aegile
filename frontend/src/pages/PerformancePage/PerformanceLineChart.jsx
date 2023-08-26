import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js/auto';
import {
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useState } from 'react';
import { useEffect } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

const PerformanceLineChart = ({
  chartTitle,
  labelTitle,
  chartData,
  additionalData,
  hasAdditionalSelect,
  additionalSelectTitle = '',
  yAxisLabel = '',
  xAxisLabel = 'Date',
  mainColor = 'rgb(135, 124, 228)',
  mainShade = 'rgba(135, 124, 228, 0.3)',
  chartPrecision = 0,
}) => {
  const secondaryColor = 'rgb(124, 165, 228)';
  const secondaryShade = 'rgba(124, 165, 228, 0.3)';

  const [selection, setSelection] = useState(
    hasAdditionalSelect ? Object.keys(additionalData)[0] : ''
  );
  const [additionalDatasets, setAdditionalDatasets] = useState([]);

  useEffect(() => {
    !!additionalData
      ? setAdditionalDatasets([
          {
            fill: true,
            label: hasAdditionalSelect ? selection : additionalSelectTitle,
            data: hasAdditionalSelect
              ? additionalData[selection]?.map((row) => row.data)
              : additionalData?.map((row) => row.data),
            borderColor: secondaryColor,
            backgroundColor: secondaryShade,
            lineTension: 0.4,
          },
        ])
      : setAdditionalDatasets([]);
  }, [selection, additionalData, additionalSelectTitle, hasAdditionalSelect]);

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
        backgroundColor: '#fff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {chartTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Refreshes every 24 hours
          </Typography>
        </Box>
        {hasAdditionalSelect && (
          <FormControl>
            <InputLabel>{additionalSelectTitle}</InputLabel>
            <Select
              label={additionalSelectTitle}
              value={selection}
              sx={{ minWidth: 200 }}
              onChange={(e) => setSelection(e.target.value)}
            >
              {Object.keys(additionalData).map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          minHeight: 250,
          alignItems: 'center',
        }}
      >
        <Line
          width="100%"
          height="100%"
          options={{
            responsive: true,
            maintainAspectRatio: false,
            legend: {
              display: true,
              position: 'bottom',
            },
            layout: {
              padding: {},
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: yAxisLabel,
                },
                ticks: {
                  precision: chartPrecision,
                },
                min: 0,
                grace: '5%',
              },
              x: {
                title: {
                  display: true,
                  text: xAxisLabel,
                },
              },
            },
          }}
          data={{
            labels: chartData?.map((row) => row.label),
            datasets: [
              {
                fill: true,
                label: labelTitle,
                data: chartData?.map((row) => row.data),
                borderColor: mainColor,
                backgroundColor: mainShade,
                lineTension: 0.4,
              },
              ...additionalDatasets,
            ],
          }}
        />
      </Box>
    </Box>
  );
};
export default PerformanceLineChart;
