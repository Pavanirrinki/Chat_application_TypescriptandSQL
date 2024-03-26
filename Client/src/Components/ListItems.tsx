import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { allgroupsofuserprops } from './Groups';







export function AlignItemsList({allgroupsofuser,setGroupId}:{allgroupsofuser:allgroupsofuserprops[] | null,setGroupId:(id:number)=>void}) {
    
  return (
    
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper',marginTop:"60px",maxHeight: '100vh', overflowY: 'auto',cursor:"pointer"}}>
{(allgroupsofuser !== null) && allgroupsofuser.map((userdata, index) => (
    <React.Fragment key={index}>
        <ListItem alignItems="flex-start" onClick={()=>setGroupId(userdata?.groupId)}>
            <ListItemAvatar>
                <Avatar alt="Remy Sharp" src={userdata?.profile_pic ? userdata?.profile_pic.toString() : ''}/>
            </ListItemAvatar>
            <ListItemText
                primary={`${userdata?.groupName}`}
                secondary={
                    <React.Fragment>
                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                        >
                            Ali Connors
                        </Typography>
                        {" — I'll be in your neighborhood doing errands this…"}
                    </React.Fragment>
                } 
            />
        </ListItem>
        <Divider variant="inset" component="li" />
    </React.Fragment>
))}

 </List>
  );
}