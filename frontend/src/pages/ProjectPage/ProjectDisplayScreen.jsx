import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import ProjectCard from './ProjectCard';
import { fetchAPIRequest } from '../../helpers';

// Icons
import { LoadingScreen } from '../../components';

export default function ProjectDisplayScreen({ refetchProjects }) {
  // Project card array
  const [projectCards, setProjectCards] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadedImageCount, setLoadedImageCount] = useState(0);

  // Fetch and render
  const fetchAndRenderProjects = async () => {
    setLoadedImageCount(0);
    setAllImagesLoaded(false);
    setIsLoading(true);
    try {
      const response = await fetchAPIRequest('/project', 'GET');
      setProjectCards(response.projects);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleImageLoad = () => {
    if (loadedImageCount >= 0 && loadedImageCount < projectCards.length) {
      setLoadedImageCount((prevCount) => prevCount + 1);
    }
  };
  useEffect(() => {
    if (loadedImageCount > 0 && loadedImageCount >= projectCards.length) {
      setTimeout(() => {
        setAllImagesLoaded(true);
      }, 500);
    }
  }, [loadedImageCount, projectCards.length]);

  // Rendering project cards
  useEffect(() => {
    fetchAndRenderProjects();
  }, [isEdit, refetchProjects]);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        px: 4,
        gap: 6,
      }}
    >
      {projectCards.map((project) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          name={project.name}
          subheading={project.subheading}
          description={project.description}
          deadline={project.end_date}
          progress={project.progress}
          noTasks={project.tasks}
          members={project.members}
          setIsEdit={setIsEdit}
          isLoading={!allImagesLoaded}
          incrementLoadedCount={handleImageLoad}
        />
      ))}
      {projectCards.length <= 0 && (
        <Typography variant="h6" color="text.secondary" sx={{ ml: 2, flex: 1 }}>
          No projects yet... Create a new one to get started!
        </Typography>
      )}
    </Box>
  );
}
