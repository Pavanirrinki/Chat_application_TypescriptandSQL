import * as React from "react";
import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
  Avatar,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import axios from "axios";
import { API } from "./Api";
import UploadStatus from "./UploadStatus";
import { CloseFullscreenOutlined, CloseOutlined } from "@mui/icons-material";

export interface statusDataprops {
  statusId: Number;
  userId: string;
  status: string;
  createdAt: Date;
}

export interface particular_user_status_props {
  profile_pic: string;
  first_name: String;
  last_name: String;
}

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

function Statuses() {
  const [progress, setProgress] = React.useState(0);
  const [statusCount, setStatusCount] = React.useState(0);
  const [statusindexcount, setStatusindexcount] = React.useState(0);
  const [statusData, setStatusData] = React.useState<statusDataprops[] | null>(null );
  const [open,setOpen] = React.useState<boolean>(false);
  const [particular_user_status, setParticular_user_status] =
    React.useState<particular_user_status_props | null>(null);
  const [profiles, setProfiles] = React.useState<String[] | null>(null);
  const [replyText, setReplyText] = React.useState<string>(" ");
  const user_data = localStorage.getItem("Chat_user_details");
  const parsed_data = user_data && JSON.parse(user_data);

  const fetchData = React.useCallback(() => {
    axios
      .get(API + "status_profiles")
      .then((response) => {
        setProfiles(response.data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 100 ? 0 : prevProgress + 10
      );
      if (progress >= 100) {
        if (statusData && statusData.length - 1 <= statusindexcount) {
          setStatusCount(0);
          setStatusindexcount(0);
        } else {
          setStatusCount((prev) => prev + 1);
          setStatusindexcount((prev) => prev + 1);
          setProgress(0);
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [progress]);

  const ForwardStatus = (e: React.MouseEvent<HTMLOrSVGElement>) => {
    e.preventDefault();

    if (statusData && statusData.length - 1 <= statusindexcount) {
      setStatusCount(0);
      setStatusindexcount(0);
    } else {
      setStatusindexcount((prev) => prev + 1);
      setStatusCount((prev) => prev + 1);
    }
  };

  const Render_user_status = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    id: string,
    profile_pic: string,
    first_name: string,
    last_name: string
  ) => {
    setOpen(false);
    setStatusCount(0);
    setStatusindexcount(0);
    setProgress(0);
    axios
      .get(API + `get_status_data/${id}`)
      .then((response) => {
        setStatusData(response.data);
        setParticular_user_status({ profile_pic, first_name, last_name });
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const sendReply = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    statusId: Number,
    status: string,
    receiverId: string
  ) => {
    axios
      .post(API + "sendmessage", {
        SenderId: parsed_data?.sendeddata?.userId,
        message: replyText,
        ReceiverId: receiverId,
        statusId: statusId,
        status: status,
      })
      .then((data: any) => {
        console.log(data.data);
        setReplyText("");
      })
      .catch((error) => console.log(error.message));
  };

  return (
    <>
      <Grid container sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Grid item xs={3}>
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              marginLeft: "30px",
              marginTop: "20px",
            }}
            variant="subtitle1"
            fontWeight="bold"
          >
            Status profiles
          </Typography>
          <UploadStatus />
          {profiles &&
            profiles?.map((data: any) => {
              return (
                <>
                  {profiles &&
                    profiles.map((data: any) => {
                      return parsed_data?.sendeddata?.userId !== data[0] ? (
                        <Box
                          display="flex"
                          alignItems="center"
                          margin="20px"
                          gap={4}
                          key={data[0]}
                          onClick={(e) =>
                            Render_user_status(
                              e,
                              data[0],
                              data[3],
                              data[1],
                              data[2]
                            )
                          }
                          sx={{ cursor: "pointer" }}
                        >
                          <Avatar
                            alt="Remy Sharp"
                            src={data[3]}
                            sx={{ width: 56, height: 56 }}
                          />
                          <Typography>
                            {data[1]} {data[2]}
                          </Typography>
                        </Box>
                      ) : null;
                    })}
                </>
              );
            })}
        </Grid>
        {(statusData && !open) ? (
          <Grid
            item
            xs={5}
            sx={{ backgroundColor: "black", height: "100vh", width: "600px" }}
          >
            <IconButton
           onClick={()=>setOpen(true)}
      sx={{ position: 'absolute', top: 0, right: 0,color:"black" }}
    >
      <CloseOutlined />
    </IconButton>
            
            <Grid container>
              {statusData &&
                statusData.map((data, index) => (
                  <Grid item xs={12 / statusData.length} key={index}>
                    <LinearProgressWithLabel
                      value={index === statusCount ? progress : 0}
                      
                    />
                   </Grid>
                   
                ))}
                
            </Grid>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <Avatar
                alt="Remy Sharp"
                src={particular_user_status?.profile_pic}
                sx={{ width: 56, height: 56, margin: "10px 10px 0px 10px" }}
              />
              <Stack>
                <Typography
                  sx={{
                    color: "white",
                    marginLeft: "20px",
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {particular_user_status?.first_name}{" "}
                  {particular_user_status?.last_name}
                </Typography>
              </Stack>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ArrowBackIosNewIcon
                sx={{ color: "white", fontSize: "50px", fontWeight: "bold" }}
              />
              {(statusData) &&
                statusData.map((data, index) => {
                  return (
                    <React.Fragment key={index}>
                      {parsed_data?.send}
                      {index === statusindexcount ? (
                        <>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "column",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "white",
                                  marginLeft: "20px",
                                  fontWeight: "bold",
                                }}
                              >
                                {new Date(data.createdAt).toLocaleDateString()}{" "}
                                {new Date(data.createdAt).toLocaleTimeString()}
                              </Typography>
                            </div>
                            <img
                              src={data.status}
                              style={{
                                marginTop: "0px",
                                height: "78vh",
                                width: "90%",
                              }}
                              alt="Status Image"
                            />
                            <TextField
                              id="outlined-basic"
                              placeholder="Reply............"
                              variant="outlined"
                              fullWidth
                              onChange={(e) => setReplyText(e.target.value)}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <SendOutlinedIcon
                                      style={{
                                        cursor: "pointer",
                                        color: "white",
                                        marginRight: "20px",
                                        fontSize: "30px",
                                      }}
                                      onClick={(e) =>
                                        sendReply(
                                          e,
                                          data.statusId,
                                          data.status,
                                          data.userId
                                        )
                                      }
                                    />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiInputLabel-root": {
                                  color: "white", // Change label color
                                },
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: "white", // Change outline color
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "white", // Change outline color on hover
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "white", // Change outline color when focused
                                  },
                                  marginTop: "10px",
                                  padding: "0px",
                                  borderRadius: "20px",
                                  color: "whitesmoke",
                                },
                              }}
                            />
                          </div>
                        </>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              <ArrowForwardIosIcon
                sx={{
                  color: "white",
                  fontSize: "50px",
                  fontWeight: "bold",
                  textAlign: "right",
                }}
                onClick={(e) => ForwardStatus(e)}
              />
            </Box>
          </Grid>
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
                  Hi,Buddy Welcome to Status Page Please Click on Profile
                </Typography>
              </Box>
            </Paper>
          </Container>
        )}
      </Grid>
    </>
  );
}

export default Statuses;
