import './App.css';
import Profiles from './Components/Profiles';
import ChatsScreen from './Components/ChatsScreen';
import Signup from './Components/Signup';
import Login from './Components/Login';
import { BrowserRouter, Route, Routes,Navigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import NotFound from './Components/NotFound';
import { ChatContext } from './Components/Context';
import { io } from 'socket.io-client';
import Statuses from './Components/Statuses';

function Mainscreen(){
 const [receiverId,setReceiverId] = useState<string>('');
 const [profileName,setProfileName] = useState<String>("");
 const [profile_pic,setProfile_pic] = useState<string>('');



 return( 
    <Grid container>
      <Grid item xs={12} md={3}>
        <Profiles receiverId={receiverId} setReceiverId={setReceiverId} 
        profileName={profileName} setProfileName={setProfileName} profile_pic={profile_pic} setProfile_pic={setProfile_pic} 
       />
      </Grid>
      <Grid item xs={12} md={9} sx={{display:{xs:"none",md:"block"}}}>
        <ChatsScreen receiverId={receiverId} profileName={profileName} profile_pic={profile_pic} />
      </Grid>
      </Grid>
  )
}


function App() {
  const { chatData, setChatData,socket,setSocket } = useContext(ChatContext);
  const socketed = io('http://localhost:5001/')
  const [isLoggedIn, setIsLoggedIn] = useState<Boolean>(false);
  useEffect(() => {
   
    const user_data = localStorage.getItem("Chat_user_details");
    const parsed_data = user_data && JSON.parse(user_data);
    if (parsed_data && parsed_data.token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [isLoggedIn]);
 
console.log("socketed",socket);
console.log("socketed123",socketed);
  return (
<BrowserRouter>
<Routes>
        <Route path='/' element={(isLoggedIn) ? <Mainscreen /> : <Navigate to='/login' />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={(!isLoggedIn) ? <Login /> : <Navigate to='/' />}/>
        <Route path="/statuses" element={<Statuses />} />
        <Route path ='*'  element={<NotFound />} />

      </Routes>
</BrowserRouter>


  );
}

export default App;

