import * as React from 'react';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { Box, CircularProgress, Container, Paper, Typography } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import axios from 'axios';
import { API } from './Api';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));


export default function  UploadStatus() {
  const [increaseStatuscount,setIncreaseStatuscount] = React.useState<number>(0);
    const [mystatus,setMystatus] = React.useState<any>(null);
    const [image,setImage] = React.useState<string | ArrayBuffer | null>(null);
    const [open, setOpen] = React.useState(false);
    const [loading,setLoadining] = React.useState<boolean>(false);
    const [statusOpen,setStatusOpen] = React.useState<boolean>(false)
    const user_data = localStorage.getItem("Chat_user_details");
    const [opened,setOpened] =React.useState(true);
     const parsed_data = user_data && JSON.parse(user_data);
  const handleClose = () => {
    setOpen(false);
    
  };
  const handleClosed = () => {
    setOpened(false);
    setStatusOpen(false);
  };
  React.useEffect(()=>{
axios.get(API+`get_status_data/${[parsed_data?.sendeddata?.userId]}`).then((data)=>{
  setMystatus(data.data)
}).catch((error)=>{
  console.log(error.message)
})
  },[])
const StatusHandler = async (e:React.ChangeEvent<HTMLInputElement>)=>{

   const file = e.target.files && e.target.files[0];
   if(file){

   const reader =await new FileReader();
    reader.onloadend = () => {
     console.log(reader,'reader')
       setImage(reader.result);
       setOpen(true);
   };
   reader.readAsDataURL(file);
  }
}
const SendStatus =(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
   e.preventDefault();
    setLoadining(true);
    axios.post(API + "add_status", {
        user_id: parsed_data?.sendeddata?.userId,
        textData:image
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then((data: any) => {
        console.log(data.data);
        setLoadining(false);
        setOpen(false)
    })
    .catch((error) => {
        console.log(error.message);
    });
    
    }
    
    const UserStatusdata=(e:React.MouseEvent<HTMLDivElement,MouseEvent>)=>{
               e.preventDefault();
               setStatusOpen(true);
               setOpened(true);
    }
    const increaseCount = () => {
      console.log("clicked", increaseStatuscount);
    
      if (increaseStatuscount < mystatus.length - 1) {
        setIncreaseStatuscount((prev) => prev + 1);
      } else {
        setIncreaseStatuscount(0);
      }
    };
    
    const decreaseCount = () => {
      console.log("clicked", increaseStatuscount);
    
      if (increaseStatuscount > 0) {
        setIncreaseStatuscount((prev) => prev - 1);
      } else {
        setIncreaseStatuscount(mystatus.length - 1);
      }
    };
    
  return (
    <>
    <input
          type="file"
          accept="image/*"
          onChange={StatusHandler}
          style={{ display: "none" }}
          id="imageUploadInput" />
          <label htmlFor="imageUploadInput01" style={{ display: 'inline-block' }}>


          <Stack direction="row" display="flex"
    alignItems="center"
    margin="20px"
    gap={4}
    sx={{ cursor: "pointer" }}
>
    <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <label htmlFor="imageUploadInput" style={{ display: 'inline-block',cursor:"pointer" }}>
        <AddCircleOutlinedIcon sx={{backgroundColor:"white",borderRadius:"50%"}}/></label>}
    >
     
                <Avatar 
                    alt="Travis Howard" 
                    src={parsed_data?.sendeddata?.profile_pic} 
                    sx={{ height: 56, width: 56 }}
                    onClick={(e)=>UserStatusdata(e)} 
                />
         
    </Badge>
    <label htmlFor="imageUploadInput" style={{ display: 'inline-block',cursor:"pointer" }}>
    <Typography>Add Status</Typography>
    </label>
</Stack>

          </label>
          
          
          
          
          
          
          
          <React.Fragment>
     
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
         <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
         Media File
       </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
        <img src={image ? image.toString():''} style={{height:"300px",width:"500px"}}/>
        </DialogContent>
        <DialogActions>
            {!loading ?
          <Button autoFocus onClick={(e)=>SendStatus(e)}>
          <SendIcon />
          </Button>:(
    <Box sx={{ display: 'flex' }}>
      <CircularProgress />
    </Box>)}
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment> 
   
          
          
    {/* -----------------------------------USER STATUSES--------------------------------------------------  */}
     <React.Fragment>

{(statusOpen) &&
 <BootstrapDialog onClose={handleClosed} aria-labelledby="customized-dialog-title" open={opened} sx={{height:"100vh"}}>
 <IconButton
   aria-label="close"
   onClick={handleClosed}
   sx={{
     position: 'absolute',
     right: 8,
     top: 8,
     color: (theme) => theme.palette.grey[500],
  
   }}
 >
   <CloseIcon />
 </IconButton>
 <DialogContent dividers>
  <Stack sx={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"row"}} style={{height:"80vh",width:"100%"}}>
    {mystatus &&
  <ArrowBackIosNewOutlinedIcon onClick={decreaseCount}/>}
   {mystatus ? mystatus?.map((data:any,index:number)=>{
     return(
      <>
      {(increaseStatuscount == index) &&
       <img src={data.status} alt="" style={{height:"80vh",width:"100%"}}/>}
       </>
     )
   }):<Container
   maxWidth="xs"
   sx={{
     display: "flex",
     justifyContent: "center",
     alignItems: "center",
     height: "80vh",
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
         Hi,Buddy Their Is No Upload Statuses Today
       </Typography>
     </Box>
   </Paper>
 </Container>}
   {mystatus &&
   <ArrowForwardIosOutlinedIcon onClick={increaseCount}/>}
   </Stack>
 </DialogContent>
</BootstrapDialog>
}
      </React.Fragment>     
          
          

          
          
          </> 
  );
}