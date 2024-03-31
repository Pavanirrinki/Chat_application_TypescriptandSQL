import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { allgroupsofuserprops } from "./Groups";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import { ChatContext } from "./Context";
import axios from "axios";
import { API } from "./Api";
import StarIcon from "@mui/icons-material/Star";

export function AlignItemsList({
  allgroupsofuser,
  setGroupId,
}: {
  allgroupsofuser: allgroupsofuserprops[] | null;
  setGroupId: (id: number) => void;
}) {
  const { chatData, setChatData, socket, setSocket } =
    React.useContext(ChatContext);
  const user_data = localStorage.getItem("Chat_user_details");
  const parsed_data = user_data && JSON.parse(user_data);
  const [favouriteGroup, setFavouriteGroup] = React.useState<any>(null);
  const FetchGroupData = async (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    groupId: number
  ) => {
    e.preventDefault();
    await socket.emit("join Room", groupId);
    setGroupId(groupId);
  };
  React.useEffect(() => {
    axios
      .get(API + `favourite_groups/${parsed_data?.sendeddata?.userId}`)
      .then((data) => {
        console.log(data.data, "favourite_groups");
        setFavouriteGroup(data.data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  console.log(favouriteGroup, "favourite_groups890");
  const GroupAddToFavourite = async (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    groupId: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    await axios
      .post(API + `profiles_add_to_groups`, {
        groupId,
        userId: parsed_data?.sendeddata?.userId,
      })
      .then(async (data) => {
        console.log(data.data);
        await axios
          .get(API + `favourite_groups/${parsed_data?.sendeddata?.userId}`)
          .then((data) => {
            console.log(data.data, "favourite_groups");
            setFavouriteGroup(data.data);
          })
          .catch((error) => {
            console.log(error.message);
          });
      })
      .catch((error) => console.log(error.message));
  };
  console.log("allgroupsofuser", allgroupsofuser);
  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
        marginTop: "60px",
        maxHeight: "100vh",
        overflowY: "auto",
        cursor: "pointer",
      }}
    >
      {allgroupsofuser !== null &&
        allgroupsofuser.map((userdata, index) => (
          <React.Fragment key={index}>
            <ListItem
              alignItems="flex-start"
              onClick={(e) => FetchGroupData(e, userdata?.groupId)}
            >
              <ListItemAvatar>
                <Avatar
                  alt="Remy Sharp"
                  src={
                    userdata?.profile_pic
                      ? userdata?.profile_pic.toString()
                      : ""
                  }
                />
              </ListItemAvatar>

              <ListItemText
                primary={`${userdata?.groupName}`}
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
                {Array.isArray(favouriteGroup) &&
                favouriteGroup.flat().includes(userdata?.groupId) ? (
                  <StarIcon sx={{ opacity: 0.8, color: "yellow" }} />
                ) : (
                  <StarOutlineIcon
                    onClick={(e) => GroupAddToFavourite(e, userdata.groupId)}
                    sx={{ opacity: 0.8 }}
                  />
                )}
              </ListItemAvatar>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
    </List>
  );
}
