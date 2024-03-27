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
  CardContent} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { SendMessageApi,GetMessage } from './Api';
import io from 'socket.io-client';
import BasicMenu from './MenuComponent';

const user_data = localStorage.getItem("Chat_user_details");
const parsed_data = user_data && JSON.parse(user_data);

function ChatsScreen({ receiverId,profileName,profile_pic}:
  { receiverId: string,profileName:String,profile_pic:String| null}): JSX.Element {

  const [Inputmessage,setInputmessage] = useState<string>('');
  const [loaddata,setLoaddata] = useState<Boolean>(false)
  const [chatting,setChatting] = useState<string[] | null>([]);
  const [typing,setTyping] = useState<string>('');
  const imageExtensionsRegex = /\.(jpg|jpeg|png|gif|bmp|webp)$/i;
  const fileExtensionsRegex = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i;
  const videoExtensionsRegex = /\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i;
  useEffect(()=>{
    const socket = io('http://localhost:5001/',{
  query:{
    userId:parsed_data?.sendeddata?.userId
  }
});

socket.on("message", (data123: string[]) => {
  console.log(data123, "daata123");

      setChatting((prev: any) => [...prev,data123]);
 
});


     socket.on('Typingstarted',(data:any)=>{
      setTyping(data)
     })
     socket.on('Typingstop',(data:any)=>{
      setTyping(data)
     })
     return () => {
    socket.disconnect();
    };
  },[])
useEffect(()=>{
GetMessage(parsed_data?.sendeddata?.userId,receiverId).
then((data)=>{setChatting(data);
  setLoaddata(false)}).catch((error)=>console.log(error))
},[receiverId,loaddata])



  const Typemessage =(e:React.ChangeEvent<HTMLInputElement>) =>{
    const socket = io('http://localhost:5001/');
    setInputmessage(e.target.value);
   
     socket.emit("Typing",receiverId)
  }

  const sendMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
     e.preventDefault();
     
   
     const socket = io('http://localhost:5001/');
     SendMessageApi("sendmessage",parsed_data?.sendeddata?.userId,receiverId,Inputmessage)
     .then((data)=>{setInputmessage("");setLoaddata(true);socket.emit("Typingstopped",receiverId);
    ;

  }).catch((error)=>console.log(error));
};
console.log("chatting",chatting);
    return (
      <>
      {receiverId && receiverId !== undefined? 
     <Stack sx={{marginLeft:"20px"}}>
     
   <ListItemButton sx={{zIndex:"100px",position:"fixed",backgroundColor:"white",width:"100vw"}}>
                <ListItemAvatar>
                    <Avatar alt="Remy Sharp" src={profile_pic ? profile_pic?.toString():"/static/images/avatar/1.jpg"} />
                </ListItemAvatar>
                <Box>
                <ListItemText primary={profileName} sx={{ fontWeight: "bolder",marginBottom:"0px"}} />
                <ListItemText primary={typing == "Typing" ? "typing....":""} sx={{ fontWeight: "bold",textAlign:"left",fontSize:"15px",marginTop:"0px"}} />
                </Box>
            </ListItemButton>
           
           
            <Grid container sx={{ marginLeft: "10px",marginBottom:"100px",marginTop:"80px"}}>
                {chatting && chatting.map((data:any) => {
                  console.log(data[3])
                    return (
                        <React.Fragment key={data.message_id}>
                            <Grid item xs={12} sx={{ wordBreak: "break-all", display: "flex",  justifyContent: (parsed_data?.sendeddata?.userId === data.sender_id) ? "flex-start" : "flex-end", marginTop: "10px" }}>
                              {data?.message?.startsWith("http://res.cloudinary.com/") && 
                              (imageExtensionsRegex.test(data.message) ) && <img src={data.message} alt="image" style={{width:"200px",height:"200px"}}/> }
                              {(!data?.message?.startsWith("http://res.cloudinary.com/") && !fileExtensionsRegex.test(data.message) && !data?.statusId) &&
                                <Typography sx={{ width: "40%", border: "1px solid grey", borderRadius: "10px", backgroundColor: (parsed_data?.sendeddata?.userId === data.sender_id) ? null: "#25D366",}}>
{data?.message}</Typography>}


{fileExtensionsRegex.test(data?.message) ?(
  <>
    <embed src={require(`./uploads/${data?.message}`)} width="500" height="375" />
    {console.log(require(`./uploads/${data?.message}`))}
   </>
):null }


{data?.message?.startsWith("http://res.cloudinary.com/") && 
                              (videoExtensionsRegex.test(data?.message) ) && 
                              <video controls style={{width:"300px",height:"100px"}}>
  <source src={data.message} type="video/mp4" />
  Your browser does not support the video tag.
</video>
}
 
    {(data?.lob_data !== null && data?.statusId !== null && data?.lob_data?.length > 5000)&& (
      <Card sx={{ maxWidth: 345 }}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="180"
            image={data.lob_data }
            alt="Chat Image"
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all", color: "black", fontSize: "20px" }}>
             {data?.message}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    )}


                            </Grid>
                           
</React.Fragment>
)
})}


</Grid>
<Box sx={{ width:{xs:'100%',md:"75%"}, bottom: 0, padding: '10px', backgroundColor: 'white',position:"fixed" }}>
    
            <Grid container spacing={1} alignItems="center" >
            <Grid item xs={1} >
              <BasicMenu senderId={parsed_data?.sendeddata?.userId} receiverId={receiverId} setLoaddata={setLoaddata} setChatting={setChatting}/>
          {/* <AttachFileIcon sx={{marginRight:"10px"}}/> */}
              
              </Grid>
              <Grid item xs={9}>
                <TextField fullWidth variant="outlined" placeholder="Type a message" size="small" value={Inputmessage} onChange={Typemessage}/>
               
              </Grid>
              <Grid item xs={1}>
                <Button variant="contained" color="primary" fullWidth onClick={sendMessage}>Send</Button>
              </Grid>
            </Grid>
</Box>
     </Stack>:
     <Container maxWidth="xs" sx={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh"}}>
     <Paper elevation={8} sx={{borderRadius:"10px"}}>
      <Box  height="60vh" display='flex' justifyContent="center" alignItems="center">
       <Typography padding={3} variant='h6' textAlign='center'>Hi,Buddy Welcome to Messenger Application</Typography>
      </Box>
      </Paper>  
     </Container>
} 
     </>       
                
)
}

export default ChatsScreen