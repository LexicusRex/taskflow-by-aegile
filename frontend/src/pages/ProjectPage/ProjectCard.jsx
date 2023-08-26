import React, { useEffect, useState } from 'react';
import {
  Card,
  Box,
  Typography,
  AvatarGroup,
  Avatar,
  Skeleton,
} from '@mui/material';

// Icons
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import { useNavigate } from 'react-router-dom';
import EditProjectButton from './EditProjectButton';

export default function ProjectCard({
  id,
  name,
  subheading,
  description,
  noTasks,
  members,
  deadline,
  progress,
  isLoading,
  incrementLoadedCount,
  setIsEdit,
}) {
  const navigate = useNavigate();

  // Hovering
  const [isHovered, setIsHovered] = useState(false);
  const [isEditState, setIsEditState] = useState(false);

  // Gives status colour
  const getStatusColour = () => {
    // Check for deadline against current date
    const breakDown = deadline.split('/');
    const dueDate = new Date(breakDown[2], breakDown[1] - 1, breakDown[0]);
    const today = new Date();
    const isOverdue = dueDate.getTime() < today.getTime();
    if (isOverdue) {
      return ['Overdue', '#F64E43'];
    } else if (progress === 100) {
      return ['Finished', '#3FBE7F'];
    } else if (progress >= 0) {
      return ['Ongoing', '#F6B943'];
    } else {
    }
  };
  getStatusColour();

  const [memberHandleList, setMemberHandleList] = useState([]);

  useEffect(() => {
    const handleList = [];
    for (const mem of members) {
      handleList.push(mem.handle);
    }
    setMemberHandleList(handleList);
    incrementLoadedCount();
  }, [members, incrementLoadedCount]);

  return (
    <Box>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          width: '400px',
          height: '350px',
          boxShadow: 3,
          borderRadius: '10px',
          '&:hover': {
            cursor: 'pointer',
          },
        }}
        onClick={() =>
          !isEditState && navigate(`/projects/${id}`, { state: { name: name } })
        }
      >
        <Box
          sx={{
            p: 3,
          }}
        >
          <Box
            sx={{
              textAlign: 'left',
              display: 'flex',
            }}
          >
            {/* Project heading and sub-heading */}
            <Box
              sx={{
                marginBottom: '4px',
              }}
            >
              {isLoading ? (
                <Skeleton
                  variant="rounded"
                  width={290}
                  height={30}
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography
                  sx={{
                    fontSize: '20px',
                    width: 290,
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    '&:hover': {
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {name}
                </Typography>
              )}
              {isLoading ? (
                <Skeleton variant="rounded" width={290} height={21} />
              ) : (
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 'medium',
                  }}
                  color="text.secondary"
                >
                  {subheading}
                </Typography>
              )}
            </Box>
            {/* State of project */}
            <Box
              sx={{
                marginLeft: 'auto',
              }}
            >
              {!isLoading && (
                <Box
                  sx={{
                    position: 'relative',
                  }}
                >
                  {/* Status label */}
                  <Box
                    sx={{
                      transition: 'all 0.3s ease-in-out',
                      visibility: isHovered ? 'visible' : 'hidden',
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    <EditProjectButton
                      userData={{
                        id,
                        name,
                        subheading,
                        description,
                        deadline,
                        members: memberHandleList,
                      }}
                      setIsEditState={setIsEditState}
                      setIsEdit={setIsEdit}
                    />
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: getStatusColour()[1],
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      px: '6px',
                      py: '2px',
                      borderRadius: '4px',
                      display: 'flex',
                      mt: -3,
                      transition: 'all 0.3s ease-in-out',
                      visibility: isHovered ? 'hidden' : 'visible',
                      opacity: isHovered ? 0 : 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '11px',
                        mx: 'auto',
                        fontWeight: 'bold',
                      }}
                    >
                      {getStatusColour()[0]}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
          {isLoading ? (
            <Skeleton
              variant="rounded"
              sx={{ width: '100%', mt: '13px', mb: '40px' }}
              height={60}
            />
          ) : (
            <p
              style={{
                textAlign: 'left',
                fontSize: '13px',
                height: '60px',
              }}
            >
              {description}
            </p>
          )}

          {/* Project Statistics */}
          {isLoading ? (
            <Skeleton
              variant="rounded"
              width={290}
              height={16}
              sx={{ mb: '10px' }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 4,
                marginTop: '40px',
                marginBottom: '10px',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: '5px',
                }}
              >
                <FormatListBulletedOutlinedIcon fontSize="11px" />
                <Box
                  sx={{
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                >
                  {noTasks} Task(s)
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  gap: '5px',
                }}
              >
                <PermIdentityOutlinedIcon fontSize="11px" />
                <Box
                  sx={{
                    fontSize: '11px',
                    fontWeight: 500,
                  }}
                >
                  {members.length} Person(s)
                </Box>
              </Box>
            </Box>
          )}

          {/* People on project */}
          <Box
            sx={{
              display: 'flex',
            }}
          >
            {/* People icon up to four max */}
            <Box
              sx={{
                marginY: 'auto',
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex' }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Box>
              ) : (
                <AvatarGroup max={4}>
                  {members.map((member, index) => (
                    <Avatar
                      key={member.handle}
                      alt={member.name}
                      src={member.image}
                      sx={{ ml: -2 }}
                    >
                      {member.name}
                    </Avatar>
                  ))}
                </AvatarGroup>
              )}
            </Box>
            <Box
              sx={{
                marginY: 'auto',
                fontSize: '11px',
                fontWeight: 500,
                marginLeft: 'auto',
              }}
            >
              {isLoading ? (
                <Skeleton variant="rounded" width={100} height={15} />
              ) : (
                `Due Date: ${deadline}`
              )}
            </Box>
          </Box>
        </Box>
        {/* Line divider */}
        <Box
          sx={{
            height: '1px',
            backgroundColor: '#CACACA',
            marginY: '5px',
            width: '100%',
          }}
        />

        {/* Progress bar */}
        {isLoading ? (
          <Skeleton
            variant="rounded"
            width="80%"
            height={21}
            sx={{ mx: 'auto', mt: 2 }}
          />
        ) : (
          <Box sx={{ px: 3, py: 1 }}>
            {/* Progress info */}
            <Box sx={{ display: 'flex' }}>
              <Box
                sx={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              >
                Progress
              </Box>
              <Box
                sx={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginLeft: 'auto',
                }}
              >
                {progress}%
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box
              sx={{
                width: '100%',
                height: '4px',
                backgroundColor: '#D9D9D9',
                borderRadius: '10px',
                mt: '10px',
              }}
            >
              <Box
                sx={{
                  width: `${progress}%`,
                  height: '4px',
                  backgroundColor: '#8378E3',
                  borderRadius: '10px',
                }}
              ></Box>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}
