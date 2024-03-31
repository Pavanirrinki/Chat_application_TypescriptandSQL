import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import axios from "axios";
import { API } from "./Api";
import StarIcon from "@mui/icons-material/Star";
import { Box, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

function FavouriteGroups() {
  const [delete_favourite_group,setDelete_favourite_group] = React.useState<boolean>(false);
  const user_data = localStorage.getItem("Chat_user_details");
  const parsed_data = user_data && JSON.parse(user_data);
  const [favouriteGroup, setFavouriteGroup] = React.useState<any>(null);
  const navigate = useNavigate();
  React.useEffect(() => {
    axios
      .get(API + `favourite_groups/${parsed_data?.sendeddata?.userId}`)
      .then((data) => {
        console.log(
          data.data,
          "favourite_groupspppppppppppppppppppppppppppppppppppppppppppppppppppppppp"
        );
        setFavouriteGroup(data.data);
        setDelete_favourite_group(false);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, [delete_favourite_group]);
const DeleteFromFavourites =(e:React.MouseEvent<SVGSVGElement,MouseEvent>,groupId:number)=>{
e.preventDefault();
e.stopPropagation();
axios.delete(API+`delete_favourite_groups/${groupId}/${parsed_data?.sendeddata?.userId}`).then((data)=>{
  console.log(data.data);
  setDelete_favourite_group(true);
}).catch((error)=>console.log(error.message))
}
  return (
    <List
      sx={{
        maxWidth: 360,
        bgcolor: "background.paper",
        maxHeight: "100vh",

        cursor: "pointer",
        margin: "auto",
        position: "relative",
        paddingTop: "0px",
      }}
    >
      <Box
        sx={{ position: "sticky", top: 0, borderRadius: "50%", zIndex: 100 }}
      >
        <Paper
          elevation={5}
          sx={{ backgroundColor: "white", borderRadius: "50%" }}
        >
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "15px",
              fontWeight: "bold",
              padding: "10px 0px",
              backgroundColor: "white",
            }}
          >
            Favourite Groups
          </Typography>
        </Paper>
      </Box>
      {favouriteGroup !== null &&
        favouriteGroup.map((userdata: any[], index: React.Key | null | undefined) => (
          <React.Fragment key={index}>
            <ListItem alignItems="flex-start" onClick={()=>{
                    navigate('/groups',{state:userdata[0]})
            }}>
              <ListItemAvatar>
                <Avatar
                  alt="Remy Sharp"
                  src={userdata[4] ? userdata[4].toString() : ""}
                />
              </ListItemAvatar>
              <ListItemText
                primary={`${userdata[1]}`}
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: "inline" }}
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
                <StarIcon sx={{ opacity: 0.8, color: "yellow" }} onClick={(e)=>DeleteFromFavourites(e,userdata[0])}/>
              </ListItemAvatar>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
    </List>
  );
}

export default FavouriteGroups;
