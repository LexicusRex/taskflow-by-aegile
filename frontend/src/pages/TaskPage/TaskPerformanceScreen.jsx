import React, { useEffect, useState } from 'react';
import { fetchAPIRequest } from '../../helpers';
import { useParams } from 'react-router-dom';
import { LoadingScreen } from '../../components';
import PerformanceLineChart from '../PerformancePage/PerformanceLineChart';

const TaskPerformanceScreen = () => {
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [projectAnalytics, setProjectAnalytics] = useState({});
  const [myHandle, setMyHandle] = useState('');

  useEffect(() => {
    const fetchProjectPerformance = async () => {
      const projectPerformance = await fetchAPIRequest(
        '/analytics/project?projectId=' + projectId,
        'GET'
      );
      setProjectAnalytics(projectPerformance);
      setMyHandle(Object.keys(projectPerformance)[0]);
      setIsLoading(false);
    };

    fetchProjectPerformance();
    const performanceInterval = setInterval(() => {
      console.log('Updating performance stats');
      fetchProjectPerformance();
    }, 20000);
    return () => clearInterval(performanceInterval);
  }, [projectId]);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <PerformanceLineChart
      chartTitle="Project Contributions"
      labelTitle="Your contribution"
      chartData={projectAnalytics[myHandle]}
      additionalData={Object.keys(projectAnalytics)
        .filter((key) => key !== myHandle)
        .reduce((cur, key) => {
          return Object.assign(cur, { [key]: projectAnalytics[key] });
        }, {})}
      hasAdditionalSelect
      additionalSelectTitle="Member & Overall Contributions"
    />
  );
};
export default TaskPerformanceScreen;
