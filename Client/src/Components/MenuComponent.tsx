import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import PhotoOutlinedIcon from "@mui/icons-material/PhotoOutlined";
import VideoCameraBackOutlinedIcon from "@mui/icons-material/VideoCameraBackOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { AttachFileOutlined } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import { API, GetMessage, SendMessageApi } from "./Api";
import { Box, CircularProgress } from "@mui/material";
import Login from "./Login";
import { Console } from "console";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function BasicMenu({
  receiverId,
  senderId,
  setLoaddata,
  setChatting,
}: {
  receiverId: string;
  senderId: string;
  setLoaddata: (data: boolean) => void;
  setChatting: (data: any) => void;
}) {
  const imageExtensionsRegex = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
  const fileExtensionsRegex = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i;
  const videoExtensionsRegex = /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [imagefile, setImagefile] = React.useState<any>(null);
  const [opened, setOpened] = React.useState(false);
  const [image, setImage] = React.useState<string | ArrayBuffer | null>(null);
  const [loadImage, setLoadImage] = React.useState<boolean>(false);

  const handleClosed = () => {
    setOpened(false);
  };
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const Imagechangehandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImagefile(file);
      const reader = await new FileReader();
      reader.onloadend = () => {
        console.log(reader, "reader");
        setImage(reader.result);
        setOpened(true);
      };
      reader.readAsDataURL(file);
    }
  };
  console.log(image, "image");

  const SendImageFile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(imagefile, opened, senderId, receiverId);

    try {
      setLoadImage(true);

      axios
        .post(API + "sendmessage", {
          SenderId: senderId,
          ReceiverId: receiverId,
          message: image,
        })
        .then((data) => {
          console.log(data.data);
          setOpened(false);
          setLoaddata(true);
          setLoadImage(false);
          setAnchorEl(null);
        })
        .catch((error) => console.log(error.message));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{ color: "grey" }}
      >
        <AttachFileOutlined />
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
        <input
          type="file"
          accept="image/*"
          onChange={Imagechangehandler}
          style={{ display: "none" }}
          id="imageUploadInput"
        />
        <label htmlFor="imageUploadInput" style={{ display: "inline-block" }}>
          <MenuItem>
            Image
            <PhotoOutlinedIcon sx={{ marginLeft: "10px" }} />
          </MenuItem>
        </label>{" "}
        <br />
        <input
          type="file"
          accept="video/*"
          onChange={Imagechangehandler}
          style={{ display: "none" }}
          id="videoUploadInput"
        />
        <label htmlFor="videoUploadInput" style={{ display: "inline-block" }}>
          <MenuItem>
            Video
            <VideoCameraBackOutlinedIcon sx={{ marginLeft: "10px" }} />
          </MenuItem>
        </label>{" "}
        <br />
        <input
          type="file"
          accept="file/*"
          onChange={Imagechangehandler}
          style={{ display: "none" }}
          id="fileUploadInput"
        />
        <label
          htmlFor="fileUploadInput"
          style={{ display: "inline-block" }}
          aria-disabled
        >
          <MenuItem>
            Files
            <InsertDriveFileOutlinedIcon sx={{ marginLeft: "15px" }} />
          </MenuItem>
        </label>
      </Menu>

      <React.Fragment>
        <BootstrapDialog
          onClose={handleClosed}
          aria-labelledby="customized-dialog-title"
          open={opened}
        >
          <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            Media File
          </DialogTitle>
          <IconButton
            aria-label="close"
            onClick={handleClosed}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent dividers>
            {imagefile && imageExtensionsRegex.test(imagefile.name) && (
              <img
                src={image ? image.toString() : ""}
                style={{ height: "300px", width: "500px" }}
              />
            )}
            {imagefile && videoExtensionsRegex.test(imagefile.name) && (
              <video controls style={{ width: "500px", height: "300px" }}>
                <source src={image ? image.toString() : ""} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            {imagefile && fileExtensionsRegex.test(imagefile.name) && (
              <object
                width="100%"
                height="600px"
                data={image ? image.toString() : ""}
                type="application/pdf"
              ></object>
            )}
          </DialogContent>

          <DialogActions>
            {imagefile && !fileExtensionsRegex.test(imagefile.name) ? (
              !loadImage ? (
                <Button autoFocus onClick={SendImageFile}>
                  <SendIcon />
                </Button>
              ) : (
                <Box sx={{ display: "flex" }}>
                  <CircularProgress />
                </Box>
              )
            ) : !loadImage ? (
              <Button autoFocus onClick={SendImageFile}>
                <SendIcon />
              </Button>
            ) : (
              <Box sx={{ display: "flex" }}>
                <CircularProgress />
              </Box>
            )}
          </DialogActions>
        </BootstrapDialog>
      </React.Fragment>
    </>
  );
}
