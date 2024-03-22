import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

interface CustomizedInputBaseProps {
  changehandler: (event:React.ChangeEvent<HTMLInputElement>) => void;
  setSearchProfile: (profile: string) => void;
  searchProfile: any;
}

const CustomizedInputBase: React.FC<CustomizedInputBaseProps> = ({ changehandler, setSearchProfile, searchProfile }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };
    const submitlogout =(e:React.MouseEvent<HTMLLIElement, MouseEvent>) =>{
        e.preventDefault();
        localStorage.removeItem("Chat_user_details");
        window.location.reload();
  }

  return (
    <Paper
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width:'100%' }}
    >
       <div>
      <Button
      sx={{color:"grey"}}
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
    <MenuIcon />
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>Chats</MenuItem>
        <MenuItem onClick={(e)=>submitlogout(e)}>Logout</MenuItem>
        <MenuItem onClick={()=>{navigate("/statuses")}}>Status</MenuItem>
      </Menu>
    </div>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search Profiles"
        inputProps={{ 'aria-label': 'Search Profiles' }}
        onChange={changehandler}
        value={searchProfile}
      />
      <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
        <SearchIcon />
      </IconButton>
     
    </Paper>
  );
}
export default CustomizedInputBase;