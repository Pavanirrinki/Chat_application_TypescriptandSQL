import * as React from 'react';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import { Chip } from '@mui/material';
import axios from 'axios';
import { API } from '../Components/Api';


export interface SimpleDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
  groupId:number
}

function SimpleDialog(props: SimpleDialogProps) {
  const { onClose, selectedValue, open } = props;
 const [profilesingroup,setProfilesingroup] = React.useState<any>(null);

 React.useEffect(() => {
    axios.get(API + `profiles_display_not_present_in_group/${props.groupId}`).then((data) => {
      setProfilesingroup(data.data);
    }).catch((error) => console.log(error.message));
  }, [props.groupId]);   



  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Profiles in groups</DialogTitle>
      <List sx={{ pt: 0 }}>
        {profilesingroup && profilesingroup.map((email:any) => (
          <ListItem disableGutters key={email}>
            <ListItemButton>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: blue[100], color: blue[600] }} src={email[6]}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={`${email[1]} ${email[2]}`} />
            </ListItemButton>
          </ListItem>
        ))}
 </List>
    </Dialog>
  );
}

export default function SimpleDialogDemo({memberscount,groupId}:{memberscount:number,groupId:number}) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value: string) => {
    setOpen(false);
    setSelectedValue(value);
  };

  return (
    <div>

     <Chip onClick={handleClickOpen}
    
                      label={`${(memberscount&& memberscount !== undefined) && memberscount} ${memberscount == 1
                          ? "Member"
                          : "Members"}`}
    color="success"
    />
      <SimpleDialog
              selectedValue={''}
              open={open}
              onClose={handleClose} 
              groupId={groupId}      />
    </div>
  );
}