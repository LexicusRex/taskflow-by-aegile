import { Box, Divider } from '@mui/material';
import AddMemberCard from '../pages/TaskPage/AddMemberCard';

const TeamAddMemberForm = ({ fetchMembers, selectedMembers, setMembers }) => {
  return fetchMembers.map((member, index) => {
    return (
      <Box key={'container' + index} sx={{ minWidth: '400px' }}>
        <Divider sx={{ m: 0 }} key={'divider' + index} />
        <AddMemberCard
          key={'member' + index}
          {...member}
          assigned={selectedMembers.includes(member.handle)}
          index={index}
          setMembers={setMembers}
        />
      </Box>
    );
  });
};
export default TeamAddMemberForm;
