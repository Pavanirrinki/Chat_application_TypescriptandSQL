import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import { API } from './Api';
import { Box, Button, Paper, Typography } from '@mui/material';


export default function CheckboxListSecondary() {
  const [checked, setChecked] = React.useState<string[] >([]);
 const [allProfiles,setAllProfiles] = React.useState<string[]| null>(null);

 
    
  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1 ) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };
  console.log(checked,'checked124567')
React.useEffect(()=>{
axios.get(API+'user_data').then((data)=>{
setAllProfiles(data.data)
}).catch((error)=>console.log(error.message))
},[])

const Addmemberstogroups =(e:React.MouseEvent<HTMLButtonElement,MouseEvent>) =>{
  e.preventDefault();
  axios.post(API+`add_members_to_group/898897U88`,{profiles:checked}).then((data)=>console.log(data.data)).catch((error)=>console.log(error.message))

}
  return (

    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper',margin:"auto"}}>
    <Paper elevation={6} sx={{padding:"10px",borderRadius:"30px"}}>
      <Box sx={{display:"flex",justifyContent:"space-around",alignItems:"center"}}>
    <Typography sx={{fontSize:"15px",fontWeight:"bold"}} variant='h6' >ALL PROFILES</Typography>
    <Button variant="contained" sx={{borderRadius:"30px"}} onClick={(e)=>Addmemberstogroups(e)}>Add</Button>
    </Box>
  {allProfiles && 
  allProfiles.map((value:any) => {
    
    const labelId = `checkbox-list-secondary-label-${value[0]}`;
    return (
     
      <ListItem
            key={value}
            secondaryAction={
              <Checkbox
                edge="end"
                onChange={handleToggle(value[0])}
                checked={checked.indexOf(value[0]) !== -1}
                inputProps={{ 'aria-labelledby': labelId }}
              />
            }
            disablePadding
          >
            <ListItemButton>
              <ListItemAvatar>
                <Avatar
                  alt={`profile_pic`}
                  src={value[4]}
                />
              </ListItemAvatar>
              <ListItemText id={labelId} primary={`${value[1]} ${value[2]}`} />

            </ListItemButton>
          </ListItem>
        );
  })
}
       
 </Paper>  
    </List>
 
  );
}