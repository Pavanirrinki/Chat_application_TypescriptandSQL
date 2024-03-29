import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { allgroupsofuserprops } from './Groups';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { ChatContext } from './Context';






export function AlignItemsList({allgroupsofuser,setGroupId}:{allgroupsofuser:allgroupsofuserprops[] | null,setGroupId:(id:number)=>void}) {
    const { chatData, setChatData, socket, setSocket } = React.useContext(ChatContext);
    const FetchGroupData =async (e:React.MouseEvent<HTMLLIElement, MouseEvent>,groupId:number) =>{
        e.preventDefault();
       await socket.emit("join Room", groupId); 
        setGroupId(groupId);
        
    }
    
  return (
    
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper',marginTop:"60px",maxHeight: '100vh', overflowY: 'auto',cursor:"pointer"}}>
{(allgroupsofuser !== null) && allgroupsofuser.map((userdata, index) => (
    <React.Fragment key={index}>
        <ListItem alignItems="flex-start" onClick={(e)=>FetchGroupData(e,userdata?.groupId)}>
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
     <ListItemAvatar>
<StarOutlineIcon sx={{opacity:0.5}} onClick={(e)=>e.stopPropagation()}/>
            </ListItemAvatar>
        </ListItem>
        <Divider variant="inset" component="li" />
    </React.Fragment>
))}

 </List>
  );
}