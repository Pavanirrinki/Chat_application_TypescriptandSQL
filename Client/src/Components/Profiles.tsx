import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { API } from "./Api";
import { Badge, Divider, Paper, Stack } from "@mui/material";
import { io } from "socket.io-client";
import CustomizedInputBase from "./CustomSearch";
import { ChatContext } from "./Context";

interface Onlineusers {
  [key: string]: string;
}
const Profiles = ({
  receiverId,
  setReceiverId,
  profileName,
  setProfileName,
  setProfile_pic,
  profile_pic,
  unseen_messages,
  setUnseen_messages
}: {
  receiverId: string;
  profileName: String;
  profile_pic: String | null;
  setProfile_pic: (pic: any) => void;
  setProfileName: (first_Name: any) => void;
  setReceiverId: (id: any) => void;
   setUnseen_messages:any;
    unseen_messages:any;
}): JSX.Element => {
  const { chatData, setChatData, onlineusers,socket } = useContext(ChatContext);
  const [profiles, setProfiles] = useState<String[] | null>(null);
  const [searchProfile, setSearchProfile] = useState<String>("");
  const [searchProfile123, setSearchProfile123] = useState<String[] | null>(
    null
  );
  
  const user_data = localStorage.getItem("Chat_user_details");
  const parsed_data = user_data && JSON.parse(user_data);

  const DisplayChatting = async (
    id: String,
    first_Name: String,
    pic: String
  ) => {
    setReceiverId(id);
    setProfileName(first_Name);
    setProfile_pic(pic);
    // console.log(id,'duet on the way')
    await axios
      .put(API + `update_seen_status`, {
        receiver_id: parsed_data?.sendeddata?.userId,
        sender_id: id,
      })
      .then((data) => {
        console.log(data.data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };




  useEffect(() => {
    axios
      .get(
        API +
          `get_all_messages_of_seen_userid/${parsed_data?.sendeddata?.userId}`
      )
      .then((data) => {
        setUnseen_messages(data.data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, [receiverId]);

  useEffect(() => {
    axios
      .get(API + "user_data")
      .then((data) => setProfiles(data.data))
      .catch((error) => console.log(error.message));
  }, []);

  const changehandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchProfile(e.target.value);
    const filtered: any =
      profiles &&
      profiles.filter(
        (profile) =>
          profile[1].toLowerCase().includes(e.target.value.toLowerCase()) ||
          profile[2].toLowerCase().includes(e.target.value.toLowerCase())
      );
    setSearchProfile123(filtered);
    console.log(e.target.value, "search");
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: { xs: "flex", md: "block" },
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "fixed",

          padding: "10px",
          backgroundColor: "white",
          zIndex: "1000",
        }}
      >
        <CustomizedInputBase
          changehandler={changehandler}
          searchProfile={searchProfile}
          setSearchProfile={setSearchProfile}
        />
      </Box>

      <Box
        sx={{
          marginTop: "60px",
          paddingLeft: "10px",
          paddingRight: "50px",
          overflowY: { xs: "none", md: "auto" },
          height: "100vh",
          position: { xs: "static", md: "fixed" },
          width: { md: window.innerWidth / 4, sx: window.innerWidth },
          marginLeft: { xs: "10px", md: "0px" },
        }}
      >
        {searchProfile123
          ? searchProfile123
              .filter((data) => data[0] !== parsed_data?.sendeddata?.userId)
              .map((data) => {
                return (
                  <ListItemButton
                    key={data[0]}
                    onClick={(e) => DisplayChatting(data[0], data[1], data[4])}
                  >
                    <ListItemAvatar>
                      {onlineusers && onlineusers[data[0]] ? (
                        <Badge color="success" variant="dot">
                          <Avatar
                            alt="ppp"
                            src={data[4] ? data[4] : undefined}
                          />
                        </Badge>
                      ) : (
                        <Avatar alt="ppp" src={data[4] ? data[4] : undefined} />
                      )}
                    </ListItemAvatar>
                    <ListItemText>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="h6">
                          {data[1].toLocaleLowerCase()}{" "}
                          {data[2].toLocaleLowerCase()}
                        </Typography>
                      </Box>
                    </ListItemText>
                  </ListItemButton>
                );
              })
          : profiles &&
            profiles
              .filter((data) => data[0] !== parsed_data?.sendeddata?.userId)
              .map((data) => {
                return (
                  <ListItemButton
                    sx={{ marginBottom: "20px" }}
                    key={data[0]}
                    onClick={(e) => DisplayChatting(data[0], data[1], data[4])}
                  >
                    <ListItemAvatar>
                      {onlineusers && onlineusers[data[0]] ? (
                        <Badge color="success" variant="dot">
                          <Avatar
                            alt="ppp"
                            src={data[4] ? data[4] : undefined}
                          />
                        </Badge>
                      ) : (
                        <Avatar alt="ppp" src={data[4] ? data[4] : undefined} />
                      )}
                    </ListItemAvatar>
                    <ListItemText>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="h6">
                          {data[1].toLocaleLowerCase()}{" "}
                          {data[2].toLocaleLowerCase()}
                        </Typography>
                      </Box>
                    </ListItemText>
                    {unseen_messages?.map((seendata: any) => {
                      return (
                        data[0] == seendata?.senderId &&
                        data[0] !== parsed_data?.sendeddata?.userId && (
                          <div style={{backgroundColor:"green",padding:'0px 10px',borderRadius:"50%"}}>
                          <p style={{color:"white",fontWeight:"bold",padding:"0px",margin:"5px"}}>{seendata.count}</p>
                         </div>
                        )
                      );
                    })}
                  </ListItemButton>
                );
              })}
      </Box>
    </Box>
  );
};

export default Profiles;
