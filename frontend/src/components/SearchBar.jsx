import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, Paper, InputBase } from '@mui/material';

const SearchBar = ({ searchFilter, setSearchFilter }) => {
  return (
    <Paper
      component="form"
      sx={{
        p: '4px 5px',
        pl: '10px',
        display: 'flex',
        alignItems: 'center',
        width: 350,
        height: 30,
        ml: 'auto',
      }}
    >
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Prefix id:: , due:: or desc:: to filter"
        value={searchFilter}
        onChange={(event) => setSearchFilter(event.target.value)}
      />
    </Paper>
  );
};
export default SearchBar;
