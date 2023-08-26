import { Box, Grid, Typography, Skeleton } from '@mui/material';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EditProfileBtn from './EditProfileBtn';
import { useEffect, useState } from 'react';
import AchievementCard from './AchievementCard';
import { fetchAPIRequest } from '../../helpers';
import { useParams } from 'react-router';
import { LoadingScreen, SearchBar } from '../../components';
import TaskCard from '../TaskPage/TaskCard';

const getBusynessColor = (busyness) => {
  if (busyness <= 40) return { busyColor: '#7BEF6B', busyStatus: 'light' };
  if (busyness <= 70) return { busyColor: '#FFEE4F', busyStatus: 'moderate' };
  if (busyness <= 100) return { busyColor: '#FBB16D', busyStatus: 'busy' };
  if (busyness > 100) return { busyColor: '#FF6C74', busyStatus: 'overloaded' };
};

const UserProfilePage = ({ isAuthUser }) => {
  const { handle } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isProfileImgLoading, setIsProfileImgLoading] = useState(true);
  const [myProfile, setMyProfile] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [userTasks, setUserTasks] = useState([]);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [loadedImageCount, setLoadedImageCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [profileAchievements, setProfileAchievements] = useState(null);

  const filterTasks = (taskList) => {
    return taskList.filter((task) => {
      let target = task.name;
      let query = searchFilter.split('::')[1];
      if (searchFilter.startsWith('id::')) {
        target = task.id;
      } else if (searchFilter.startsWith('desc::')) {
        target = task.description;
      } else if (searchFilter.startsWith('due::')) {
        target = task.deadline;
      } else {
        query = searchFilter;
      }
      return target.toString().toLowerCase().includes(query.toLowerCase());
    });
  };

  const renderTasks = (taskList) => {
    return taskList.map((task) => (
      <TaskCard
        key={task.id}
        id={task.id}
        projectId={task.project}
        name={task.name}
        description={task.description}
        deadline={task.deadline}
        status={task.status}
        attachment={task.attachment}
        attachmentName={task.attachmentName}
        weighting={task.weighting}
        priority={task.priority}
        assignees={task.assignees}
        assigneesData={task.assigneesData}
        setIsEdit={setIsEdit}
        isLoading={!allImagesLoaded}
        incrementLoadedCount={handleImageLoad}
        isTaskPage={false}
        showStatus={true}
        hasBoxShadow={true}
      />
    ));
  };

  const handleImageLoad = () => {
    if (loadedImageCount >= 0 && loadedImageCount < taskCount) {
      setLoadedImageCount((prevCount) => prevCount + 1);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setLoadedImageCount(0);
    setAllImagesLoaded(false);

    const fetchAchievements = async () => {
      try {
        const fetchedAchievements = await fetchAPIRequest(
          isAuthUser ? '/achievements/user' : `/achievements?handle=${handle}`,
          'GET'
        );
        setProfileAchievements(fetchedAchievements);
      } catch (err) {
        console.log(err);
      }
    };
    const fetchUser = async () => {
      try {
        const user = await fetchAPIRequest(
          isAuthUser ? '/profile' : `/user?handle=${handle}`,
          'GET'
        );
        setMyProfile(user);
        // const tasks = await fetchAPIRequest(
        //   isAuthUser ? '/task' : `/task?handle=${handle}`,
        //   'GET'
        // );
        // setUserTasks(tasks.tasks);
        // setTaskCount(tasks.tasks.length);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
    // fetchAchievements();
  }, [isAuthUser, handle, isEdit]);

  useEffect(() => {
    if (loadedImageCount > 0 && loadedImageCount >= taskCount) {
      setTimeout(() => {
        setAllImagesLoaded(true);
      }, 500);
    }
  }, [loadedImageCount, taskCount]);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <Box
      sx={{
        py: 4,
        px: 4,
        boxSizing: 'border-box',
        height: 'fit-content',
      }}
    >
      <Box
        sx={{
          textAlign: 'left',
          py: 2,
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '30px', fontWeight: 600 }}>
          Profile
        </Typography>
      </Box>

      <Grid
        container
        columnSpacing={5}
        rowSpacing={5}
        columns={12}
        sx={{ gridAutoFlow: 'column' }}
      >
        <Grid item xs={12} xl={8}>
          <Box
            sx={{
              width: '100%',
              height: 'fit-content',
              boxSizing: 'border-box',
            }}
          >
            {isAuthUser && (
              <EditProfileBtn userData={myProfile} setIsEdit={setIsEdit} />
            )}
            <Box sx={{ flex: '1 1 auto', height: '100%', width: '100%' }}>
              <Box sx={{ width: '100%', height: { xs: 125, sm: 250 } }}>
                {isImageLoading && isProfileImgLoading && (
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    sx={{
                      borderRadius: '10px 10px 0 0',
                      height: { xs: 125, sm: 250 },
                    }}
                  />
                )}
                <Box
                  component="img"
                  alt="User banner"
                  src={
                    myProfile?.banner
                      ? myProfile?.banner
                      : 'https://unsplash.it/1920/1080'
                  }
                  sx={{
                    borderRadius: '10px 10px 0 0',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: isImageLoading && isProfileImgLoading ? 0 : 1,
                    mt:
                      isImageLoading && isProfileImgLoading
                        ? { xs: '-135px', sm: '-260px' }
                        : 0,
                  }}
                  onLoad={() => {
                    setIsImageLoading(false);
                  }}
                />
              </Box>
              {isImageLoading && isProfileImgLoading && (
                <Skeleton
                  variant="circular"
                  sx={{
                    width: {
                      xs: 100,
                      sm: 150,
                      md: 175,
                      lg: 200,
                    },
                    height: {
                      xs: 100,
                      sm: 150,
                      md: 175,
                      lg: 200,
                    },
                    position: 'relative',
                    mt: {
                      xs: '-60px',
                      sm: '-100px',
                      md: '-180px',
                      lg: '-200px',
                    },
                    ml: { xs: '20px', md: '55px' },
                    zIndex: 5,
                  }}
                />
              )}
              <Box
                component="img"
                src={
                  myProfile?.raw_image
                    ? myProfile?.raw_image
                    : 'https://unsplash.it/200/200'
                }
                sx={{
                  width: {
                    xs: 100,
                    sm: 150,
                    md: 175,
                    lg: 200,
                  },
                  height: {
                    xs: 100,
                    sm: 150,
                    md: 175,
                    lg: 200,
                  },
                  borderRadius: '50%',
                  objectFit: 'cover',
                  position: 'relative',
                  mt: {
                    xs: '-60px',
                    sm: '-100px',
                    md: '-180px',
                    lg: '-200px',
                  },
                  ml: { xs: '20px', md: '55px' },
                  opacity: isImageLoading && isProfileImgLoading ? 0 : 1,
                  zIndex: 5,
                }}
                onLoad={() => {
                  setIsProfileImgLoading(false);
                }}
              />

              <Box
                sx={{
                  borderRadius: {
                    xs: '0 0 20px 20px',
                    md: '40px',
                  },
                  boxShadow: 3,
                  minHeight: 150,
                  height: 'fit-content',
                  flex: 1,
                  position: 'relative',
                  mt: {
                    xs: '-50px',
                    sm: '-75px',
                    md: '-90px',
                    lg: '-100px',
                  },
                  backgroundColor: '#fff',
                  py: { xs: 3, sm: 3, md: '35px' },
                  px: { xs: 2, sm: 3, md: '55px' },
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 4,
                }}
              >
                {/* Stats box */}
                {isImageLoading && isProfileImgLoading ? (
                  <Skeleton
                    variant="rounded"
                    width="calc(100%-200px)"
                    height={55}
                    sx={{
                      ml: {
                        xs: '110px',
                        sm: '150px',
                        md: '210px',
                      },
                      mb: 1,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 'calc(100%-200px)',
                      height: 55,
                      ml: {
                        xs: '110px',
                        sm: '150px',
                        md: '210px',
                      },
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: { xs: 12, sm: 16 },
                          textDecoration: 'underline',
                        }}
                      >
                        Email:
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: {
                            xs: 12,
                            sm: 14,
                            md: 16,
                          },
                        }}
                      >
                        {myProfile?.email}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          display: {
                            xs: 'none',
                            sm: 'block',
                          },
                          fontSize: { sm: 14, md: 16 },
                        }}
                      >
                        Projects
                      </Typography>
                      <Typography
                        fontWeight={600}
                        sx={{
                          fontSize: {
                            xs: 14,
                            sm: 18,
                            md: 24,
                          },
                        }}
                      >
                        <AssignmentIndOutlinedIcon
                          sx={{
                            width: '20px',
                            display: {
                              xs: 'block',
                              sm: 'none',
                            },
                          }}
                        />
                        {myProfile?.numProjects}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          display: {
                            xs: 'none',
                            sm: 'block',
                          },
                          fontSize: { sm: 14, md: 16 },
                        }}
                      >
                        Connections
                      </Typography>
                      <Typography
                        fontWeight={600}
                        sx={{
                          fontSize: {
                            xs: 14,
                            sm: 18,
                            md: 24,
                          },
                        }}
                      >
                        <GroupsOutlinedIcon
                          sx={{
                            width: '20px',
                            display: {
                              xs: 'block',
                              sm: 'none',
                            },
                          }}
                        />
                        {myProfile?.numConnections}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {/* Name and handle */}
                {isImageLoading && isProfileImgLoading ? (
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={75}
                    sx={{ mb: 1 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      my: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        fontWeight={600}
                        sx={{
                          fontSize: { xs: 24, sm: 32 },
                        }}
                      >
                        {`${myProfile?.first_name} ${myProfile?.last_name}`}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{
                          pl: 2,
                        }}
                      >
                        {`@${myProfile?.handle}`}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxSizing: 'border-box',
                        p: 1,
                        border: '1px solid #00000020',
                        borderRadius: 5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: 12, sm: 16 },
                          textDecoration: 'underline',
                          mb: 1,
                        }}
                      >
                        Busyness
                      </Typography>
                      <Box
                        sx={{
                          ml: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          fontSize="14"
                          sx={{ ml: 2, display: { xs: 'none', md: 'block' } }}
                        >
                          {myProfile.busyness}%
                          {/* {getBusynessColor(myProfile.busyness).busyStatus} */}
                        </Typography>
                        <Box
                          sx={{
                            width: 100,
                            height: 20,
                            bgcolor: '#e5e5e5',
                            display: 'flex',
                            justifyContent: 'flex-start',
                            boxSizing: 'border-box',
                            p: '5px',
                            ml: 1,
                            alignItems: 'center',
                            borderRadius: 5,
                          }}
                        >
                          <Box
                            sx={{
                              width: myProfile.busyness,
                              height: 10,
                              bgcolor: getBusynessColor(myProfile.busyness)
                                .busyColor,
                              border:
                                myProfile.busyness > 0 &&
                                '0.5px solid #00000020',
                              borderRadius: 5,
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
                {/* description and skills */}
                {isImageLoading && isProfileImgLoading ? (
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={38}
                    sx={{ mb: 1 }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      flex: 1,
                      display: 'flex',
                      flexDirection: {
                        xs: 'column',
                        sm: 'column',
                        md: 'row',
                      },
                      gap: 3,
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                      }}
                    >
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: 14, sm: 16 },
                        }}
                      >
                        {myProfile?.description}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        alignContent: 'start',
                        justifyContent: 'center',
                      }}
                    >
                      {myProfile?.skills?.split(',').map((skill, index) => {
                        return (
                          <Typography
                            key={'skill' + index}
                            sx={{
                              px: 2,
                              py: 1,
                              borderRadius: '50px',
                              fontSize: {
                                xs: 12,
                                sm: 14,
                              },
                              maxHeight: {
                                xs: 20,
                                md: 30,
                              },
                              backgroundColor: '#D9D9D980',
                            }}
                          >
                            {skill}
                          </Typography>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 3,
              display: 'flex',
              // maxWidth: 1100,
              minHeight: 650,
              boxSizing: 'border-box',
              borderRadius: '40px',
              boxShadow: 3,
              border: '1px solid #00000020',
              backgroundColor: '#ECEFF190',
            }}
          >
            <Box
              sx={{
                py: { xs: 3, sm: 3, md: '35px' },
                px: { xs: 2, sm: 3, md: '55px' },
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Typography
                  fontWeight={600}
                  sx={{
                    fontSize: { xs: 24, sm: 32 },
                  }}
                >
                  Tasks
                </Typography>
                <SearchBar
                  searchFilter={searchFilter}
                  setSearchFilter={setSearchFilter}
                />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  mt: 3,
                  gap: 6,
                }}
              >
                {renderTasks(filterTasks(userTasks))}
                {userTasks.length <= 0 && (
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ flex: 1 }}
                  >
                    No tasks yet...
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} xl={4}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
            }}
          >
            Achievements
          </Typography>
          <Grid
            sx={{
              height: '100%',
              boxSizing: 'border-box',
            }}
            container
            columns={2}
            spacing={3}
          >
            {profileAchievements?.map((achievement, index) => (
              <Grid item key={index} xs={2} sm={2} md={1} lg={1} xl={2}>
                <AchievementCard achievementData={achievement} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};
export default UserProfilePage;
