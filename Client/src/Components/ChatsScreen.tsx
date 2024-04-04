import {
  Avatar,
  Box,
  Divider,
  Grid,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  Button,
  Stack,
  Container,
  Paper,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from "@mui/material";
import KeyboardDoubleArrowDownOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowDownOutlined";
import React, { useEffect, useRef, useState } from "react";
import { SendMessageApi, GetMessage, API } from "./Api";
import io from "socket.io-client";
import BasicMenu from "./MenuComponent";
import axios from "axios";

const user_data = localStorage.getItem("Chat_user_details");
const parsed_data = user_data && JSON.parse(user_data);

function ChatsScreen({
  receiverId,
  profileName,
  profile_pic,
  setUnseen_messages
}: {
  receiverId: string;
  profileName: String;
  profile_pic: String | null;
  setUnseen_messages:any
}): JSX.Element {
  const [Inputmessage, setInputmessage] = useState<string>("");
  const [loaddata, setLoaddata] = useState<Boolean>(false);
  const [chatting, setChatting] = useState<string[] | null>([]);
  
  const [typing, setTyping] = useState<string>("");

  const scrollref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const socket = io("http://localhost:5001/", {
      query: {
        userId: parsed_data?.sendeddata?.userId,
      },
    });

    socket.on("message", async (data123: any) => {
      console.log(data123, "daata123", receiverId);
await axios
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
      if (receiverId == data123.sender_id) {
        setChatting((prev: any) => [...prev, data123]);
        scrollref?.current?.scrollIntoView({ behavior: "smooth" });
      }
    });

    socket.on("Typingstarted", (data: any) => {
      setTyping(data);
    });
    socket.on("Typingstop", (data: any) => {
      setTyping(data);
    });
    return () => {
      socket.disconnect();
    };
  }, [receiverId]);
  useEffect(() => {
    GetMessage(parsed_data?.sendeddata?.userId, receiverId)
      .then((data) => {
        setChatting(data);

        setLoaddata(false);
      })
      .catch((error) => console.log(error));
    }, [receiverId, loaddata]);

      

  const Typemessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const socket = io("http://localhost:5001/");
    setInputmessage(e.target.value);

    socket.emit("Typing", receiverId);
  };

  const sendMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const socket = io("http://localhost:5001/");
    SendMessageApi(
      "sendmessage",
      parsed_data?.sendeddata?.userId,
      receiverId,
      Inputmessage
    )
      .then((data) => {
        setInputmessage("");
        scrollref?.current?.scrollIntoView({ behavior: "smooth" });
       
        setLoaddata(true);
        socket.emit("Typingstopped", receiverId);
      })
      .catch((error) => console.log(error));
  };
  console.log("chatting", chatting);
  
  return (
    <>
      {receiverId && receiverId !== undefined ? (
        <Stack sx={{ marginLeft: "20px" }}>
          <ListItemButton
            sx={{
              zIndex: 1000,
              position: "fixed",
              backgroundColor: "white",
              width: "100vw",
              boxShadow: "rgba(0, 0, 0, 0.2) 0px 18px 50px -10px",
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          >
            <ListItemAvatar>
              <Avatar
                alt="Remy Sharp"
                src={
                  profile_pic
                    ? profile_pic?.toString()
                    : "/static/images/avatar/1.jpg"
                }
              />
            </ListItemAvatar>
            <Box>
              <ListItemText
                primary={`${profileName}`}
                sx={{ fontWeight: "bolder", marginBottom: "0px" }}
              />
              <ListItemText
                primary={typing == "Typing" ? "typing...." : ""}
                sx={{
                  fontWeight: "bold",
                  textAlign: "left",
                  fontSize: "15px",
                  marginTop: "0px",
                }}
              />
            </Box>
          </ListItemButton>
          <Box
            sx={{
              backgroundColor: "#f2f2f2",
              marginLeft: "10px",
              minHeight: "100vh",
            }}
          >
            <Grid
              container
              sx={{
                marginLeft: "10px",
                marginBottom: "100px",
                marginTop: "80px",
              }}
            >
              {chatting &&
                chatting.map((data: any) => {
                  console.log(data[3]);
                  return (
                    <React.Fragment key={data.message_id}>
                   
                      <Grid
                        ref={scrollref}
                        item
                        xs={12}
                        sx={{
                          wordBreak: "break-all",
                          display: "flex",
                          marginRight: "90px",
                          justifyContent:
                            parsed_data?.sendeddata?.userId === data.sender_id
                              ? "flex-start"
                              : "flex-end",
                          marginTop: "10px",
                        }}
                      >
                        {data?.message.length > 5000 &&
                          data.message.includes("data:image/png") && (
                            <img
                              src={data.message}
                              alt="image"
                              style={{ width: 345, height: "200px" }}
                            />
                          )}
                        { 
                          data.message.length < 4000 &&
                          !data?.statusId && (
                            <Typography
                              sx={{
                                width: "40%",
                                border: "1px solid grey",
                                borderRadius: "10px",
                                backgroundColor:
                                  parsed_data?.sendeddata?.userId ===
                                  data.sender_id
                                    ? "#66b3ff"
                                    : "#25D366",
                              }}
                            >
                              <Typography sx={{ marginLeft: "30px" }}>
                                {data?.message}
                              </Typography>
                            </Typography>
                          )}

                        {data.message.length > 5000 &&
                        data.message.includes("data:application/pdf") ? (
                          <>
                            <embed
                              src={data.message}
                              width="345"
                              height="200"
                              style={{ marginBottom: "30px" }}
                            />
                          </>
                        ) : null}

                        {data?.message.length > 5000 &&
                          data.message.includes("data:video/mp4") && (
                            <video
                              controls
                              style={{
                                width: "345px",
                                height: "150px",
                                marginTop: "20px",
                                backgroundColor: "black",
                              }}
                            >
                              <source src={data.message} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}

                        {data?.lob_data !== null &&
                          data?.statusId !== null &&
                          data?.lob_data?.length > 5000 && (
                            <Card sx={{ maxWidth: 345, zIndex: 100 }}>
                              <CardActionArea>
                                <CardMedia
                                  component="img"
                                  height="180"
                                  image={data.lob_data}
                                  alt="Chat Image"
                                />
                                <CardContent>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      wordBreak: "break-all",
                                      color: "black",
                                      fontSize: "20px",
                                    }}
                                  >
                                    {data?.message}
                                  </Typography>
                                </CardContent>
                              </CardActionArea>
                            </Card>
                          )}
                      </Grid>
                    </React.Fragment>
                  );
                })}
            </Grid>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: "75%" },
              bottom: 0,
              padding: "10px",
              backgroundColor: "white",
              position: "fixed",
            }}
          >
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={1}>
                <BasicMenu
                  senderId={parsed_data?.sendeddata?.userId}
                  receiverId={receiverId}
                  setLoaddata={setLoaddata}
                  setChatting={setChatting}
                />
              </Grid>
              <Grid item xs={9}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message"
                  size="small"
                  value={Inputmessage}
                  onChange={Typemessage}
                />
              </Grid>
              <Grid item xs={1}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={sendMessage}
                >
                  Send
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      ) : (
        <Container
          maxWidth="xs"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Paper elevation={8} sx={{ borderRadius: "10px" }}>
            <Box
              height="60vh"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Typography padding={3} variant="h6" textAlign="center">
                Hi,Buddy Welcome to Messenger Application
              </Typography>
            </Box>
          </Paper>
        </Container>
      )}
    </>
  );
}

export default ChatsScreen;





