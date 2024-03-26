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
import { useParams } from 'react-router-dom';

export default function CheckboxListSecondary() {
  const [checked, setChecked] = React.useState<string[]>([]);
  const [allProfiles, setAllProfiles] = React.useState<string[] | null>(null);
  const [usersAlreadyInGroup, setUsersAlreadyInGroup] = React.useState<string[] | null>(null);
  const { groupId } = useParams();

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  React.useEffect(() => {
    axios.get(API + 'user_data').then((data) => {
      setAllProfiles(data.data);
    }).catch((error) => console.log(error.message));
  }, []);

  React.useEffect(() => {
    axios.get(API + `profiles_display_not_present_in_group/${groupId}`).then((data) => {
      setUsersAlreadyInGroup(data.data);
    }).catch((error) => console.log(error.message));
  }, []);

  const AddMembersToGroups = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    axios.post(API + `add_members_to_group/${groupId}`, { profiles: checked }).then((data) => console.log(data.data)).catch((error) => console.log(error.message));
  };

const filteredProfiles = allProfiles?.filter(profile => !usersAlreadyInGroup?.some(user => user[0] === profile[0]));


  return (
    <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', margin: "auto" }}>
      <Paper elevation={6} sx={{ padding: "10px", borderRadius: "30px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <Typography sx={{ fontSize: "15px", fontWeight: "bold" }} variant='h6'>ALL PROFILES</Typography>
          <Button variant="contained" sx={{ borderRadius: "30px" }} onClick={(e) => AddMembersToGroups(e)}>Add</Button>
        </Box>
        {filteredProfiles && filteredProfiles.map((value: any) => {
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
        })}
      </Paper>
    </List>
  );
}
