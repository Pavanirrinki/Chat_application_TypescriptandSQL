import { Box,Button,CardHeader,Container,Grid,IconButton,InputBase,ListItem,Menu,MenuItem,Paper,TextField,Typography,Avatar, Card, Chip, List, ListItemAvatar,ListItemText,Stack} from"@mui/material";
import React, { useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import axios, { AxiosResponse } from "axios";
import { API } from "./Api";
import { AlignItemsList } from "./ListItems";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {useNavigate } from "react-router-dom";
export interface allgroupsofuserprops {
  created_by: string;
  groupId: number;
  groupName: string;
  profile_pic: null | string;
}
function Groups() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(
    null
  );
  const [opened, setOpened] = React.useState<boolean>(false);
  const [groupname, setGroupname] = React.useState<string>("");
  const [allgroupsofuser, setAllgroupsofuser] = React.useState<
    allgroupsofuserprops[] | null
  >(null);
  const [groupmessageswithdata, setGroupmessageswithdata] =
    React.useState<any>(null);
  const [groupId, setGroupId] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState<string>("");
  const user_data = localStorage.getItem("Chat_user_details");
  const parsed_data = user_data && JSON.parse(user_data);

  const addmembertogroup = Boolean(anchorElement);
  const handleClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget);
  };
  const addmembertogroupclose = () => {
    setAnchorElement(null);
  };

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickOpen = () => {
    setOpened(true);
    setAnchorEl(null);
  };

  const handleClosed = () => {
    setOpened(false);
  };
  useEffect(() => {
    axios
      .get(API + `all_groups_in_user/${parsed_data?.sendeddata?.userId}`)
      .then((data: any) => {
        console.log(data.data, "particular user");
        setAllgroupsofuser(data.data);
      })
      .catch((error) => {
        console.log((error as Error).message);
      });
  }, []);

  useEffect(() => {
    axios
      .get(API + `group_data/${groupId}`)
      .then((data) => {
        console.log(data.data, "creative thinking");
        setGroupmessageswithdata(data.data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, [groupId]);
  const handlesubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios
      .post(API + `create_group`, {
        groupname,
        created_by: parsed_data?.sendeddata?.userId,
      })
      .then((data: AxiosResponse<string, string>) => {
        console.log(data.data);
        axios
          .get(API + `all_groups_in_user/${parsed_data?.sendeddata?.userId}`)
          .then((data: any) => {
            console.log(data.data, "particular user");
            setAllgroupsofuser(data.data);
          })
          .catch((error) => {
            console.log((error as Error).message);
          });
      })
      .catch((error) => {
        console.log(error.message);
      });
    handleClosed();
  };
  const SendMessage = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    axios
      .post(API + `add_message_to_group/${groupId}`, {
        senderId: parsed_data?.sendeddata?.userId,
        message,
      })
      .then((data) => {
        console.log(data.data);
        setMessage(" ");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
  console.log("groupId", groupmessageswithdata, "groupId");
  return (
    <Container>
      <Grid container>
        <Grid item xs={4}>
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              position: "fixed",
              zIndex: 1000,
            }}
          >
            <div>
              <Button
                sx={{ color: "grey" }}
                id="basic-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
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
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem onClick={handleClickOpen}>Add Group</MenuItem>
                <MenuItem>Favourites</MenuItem>
              </Menu>
            </div>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search Groups..."
              inputProps={{ "aria-label": "Search Groups..." }}
            />
            <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
          {allgroupsofuser !== null && (
            <AlignItemsList
              allgroupsofuser={allgroupsofuser}
              setGroupId={setGroupId}
            />
          )}
        </Grid>
        <Grid item xs={8}>
          {groupId ? (
            <Container>
              {/*--------------------------- HEADER COMPOINENT ----------------------------------------------*/}
              <Card
                sx={{
                  borderRadius: 0,
                  position: "fixed",
                  zIndex: 1000,
                  width: "63%",
                }}
                elevation={0}
              >
                <CardHeader
                  avatar={
                    <>
                      <Button sx={{ minWidth: "auto", mr: 1 }}>
                        <ArrowBackIcon />
                      </Button>
                      <Avatar></Avatar>
                    </>
                  }
                  action={
                    <>
                      <Button
                        id="basic-button"
                        aria-controls={
                          addmembertogroup ? "basic-menu" : undefined
                        }
                        aria-haspopup="true"
                        aria-expanded={addmembertogroup ? "true" : undefined}
                        onClick={handleClicked}
                      >
                        <IconButton>
                          <MoreVertIcon />
                        </IconButton>
                      </Button>
                    </>
                  }
                  title={
                    groupmessageswithdata &&
                    groupmessageswithdata?.groupData[0][1]
                  }
                  subheader={
                    <Chip
                      label={`${
                        groupmessageswithdata && groupmessageswithdata?.count[0]
                      } ${
                        groupmessageswithdata?.count[0] == 1
                          ? "Member"
                          : "Members"
                      }`}
                      color="success"
                      clickable
                    />
                  }
                />
              </Card>

              {/* -------------------------------GROUP CHATTING MEMU ICON----------------------------------------- */}
              <Menu
                id="basic-menu"
                anchorEl={anchorElement}
                open={addmembertogroup}
                onClose={addmembertogroupclose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem onClick={() => navigate(`/all_profiles/${groupId}`)}>
                  Add Member
                </MenuItem>
              </Menu>
              {/*------------------------------ CHAT AREA COMPONENT---------------------------------------------- */}
              <Container sx={{ marginBottom: "80px", paddingTop: "80px" }}>
                {groupmessageswithdata?.groupMessages &&
                  groupmessageswithdata?.groupMessages.map(
                    (data: string[], index: any) => {
                      console.log(data, "chalo ji");

                      return (
                        <Box
                          sx={{
                            overflowY: "auto",
                            flex: "1 0 0",
                            background: "#f9f9f9",
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="center"
                            sx={{
                              py: 2,
                              position: "sticky",
                              top: 0,
                              zIndex: 2,
                              background: "#f9f9f9",
                            }}
                          >
                            <Chip
                              label={new Date(data[11]).toLocaleDateString()}
                            />
                          </Stack>
                          <List sx={{ p: 0, overflowY: "auto", flex: "1 0 0" }}>
                            {/* ----------------------------------others send messages-------------------------------------------------------------------------    */}
                            {parsed_data?.sendeddata?.userId.toString() !==
                            data[9] ? (
                              <ListItem sx={{ mb: 2 }}>
                                <Box sx={{ display: "flex", width: "80%" }}>
                                  <ListItemAvatar>
                                    <Avatar alt="Remy Sharp" src={data[6]} />
                                  </ListItemAvatar>
                                  <Paper sx={{ width: "100%", p: 1.5 }}>
                                    <ListItemText
                                      sx={{ m: 0 }}
                                      primary={`${data[1]} ${data[2]}`}
                                      secondary={
                                        <Typography variant="caption">
                                          {data[10]}
                                        </Typography>
                                      }
                                    />
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mt: 1,
                                      }}
                                    >
                                      <Typography variant="body2">
                                        {new Date(
                                          data[11]
                                        ).toLocaleTimeString()}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </Box>
                              </ListItem>
                            ) : (
                              <ListItem
                                sx={{ flexDirection: "row-reverse", mb: 2 }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    width: "80%",
                                    flexDirection: "row-reverse",
                                  }}
                                >
                                  <ListItemAvatar
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row-reverse",
                                    }}
                                  >
                                    <Avatar alt="Remy Sharp" src={data[6]} />
                                  </ListItemAvatar>
                                  <Paper
                                    sx={{
                                      width: "100%",
                                      p: 1.5,
                                      bgcolor: "#ccc",
                                    }}
                                  >
                                    <ListItemText
                                      sx={{ m: 0 }}
                                      primary={`${data[1]} ${data[2]}`}
                                      secondary={
                                        <Typography variant="caption">
                                          {data[10]}
                                        </Typography>
                                      }
                                    />
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mt: 1,
                                      }}
                                    >
                                      <Typography variant="body2">
                                        {new Date(
                                          data[11]
                                        ).toLocaleTimeString()}
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </Box>
                              </ListItem>
                            )}
                          </List>
                        </Box>
                      );
                    }
                  )}
              </Container>
              {/*----------------------------- FOOTER COMPONENT---------------------------------------- */}
              <Box
                sx={{
                  width: { xs: "100%", md: "63%" },
                  bottom: 0,
                  padding: "10px",
                  backgroundColor: "white",
                  position: "fixed",
                  zIndex: 1000,
                }}
              >
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={1}></Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type a message"
                      size="small"
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={SendMessage}
                    >
                      Send
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Container>
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
                    Hi,Buddy Welcome to Groups Page Please Click on Group
                  </Typography>
                </Box>
              </Paper>
            </Container>
          )}
        </Grid>
      </Grid>

      <React.Fragment>
        <Dialog
          open={opened}
          onClose={handleClosed}
          PaperProps={{
            component: "form",
            onSubmit: handlesubmit,
          }}
        >
          <DialogTitle>Create Group</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To Create A Group and Express your Memories And Thoughts To Loved
              Ones
            </DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="text"
              label="Enter Group Name"
              type="text"
              fullWidth
              variant="standard"
              onChange={(e) => setGroupname(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosed}>Cancel</Button>
            <Button type="submit">Add Group</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    </Container>
  );
}

export default Groups;
