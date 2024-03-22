import { Avatar, Badge, Box, Button, Container, FormControl, FormGroup, IconButton, InputAdornment, InputLabel, OutlinedInput, Paper, TextField, Typography } from '@mui/material'
import React,{useState} from 'react'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link } from 'react-router-dom';
import { LoginApi} from './Api';
import { useNavigate } from 'react-router-dom';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
export interface Loginprops{
  email:String,
  password:String
}
function Login(): JSX.Element {
  const navigate = useNavigate();
  const [userLogindetails,setUserLogindetails] = useState<Loginprops>({
    email:"",
    password:''
    
  })
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const [profile_pic, setProfile_pic] = useState<string | null>(null);
    const [selectedImage,setSelectedImage]= useState<string | ArrayBuffer | null>(null);
    const handleImageChange = async (e:React.ChangeEvent<HTMLInputElement> ) => {
     const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

 console.log(profile_pic)

    const handleClickShowPassword = () => setShowPassword((show) => !show);
  
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
    };

    const UserLoginDetails = (e:React.ChangeEvent<HTMLInputElement>) =>{
                     const {name,value} = e.target;
                     setUserLogindetails((prev)=>({
                      ...prev,[name]:value
                     }))
    }  
 
    const submitLogindetails =async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (selectedImage) {
        console.log("pppppppp");
        const formData = new FormData();
    if (typeof selectedImage === 'string') {
            formData.append("file", selectedImage);
        } else if (selectedImage instanceof Blob) {
           
            formData.append("file", selectedImage);
        } else {
            console.error("Invalid selectedImage type");
            return;
        }
    
        formData.append("upload_preset", 'xenymzuf');
    
        try {
            const response = await axios.post("https://api.cloudinary.com/v1_1/dvbvggl5f/image/upload", formData);
            LoginApi("userlogin",userLogindetails,response.data.url).then(async data =>{data && await localStorage.setItem("Chat_user_details",JSON.stringify(data));
            window.location.reload()})
          .catch(error => console.error('Error:', error.message));
            console.log(response.data.url, 'res.data.url');
        } catch (error) {
            console.error(error);
        }


    }else{
      LoginApi("userlogin",userLogindetails,null).then(async data =>{data && await localStorage.setItem("Chat_user_details",JSON.stringify(data));
      window.location.reload()})

    }
    
     
     
    };

  return (
    <Container maxWidth="sm" sx={{ backgroundColor: "#4070f4", height: "100vh", display: 'flex', justifyContent: 'center', alignItems: "center" ,flexDirection:"column",borderRadius:"20px"}}>
      
      <Badge badgeContent={   
      <>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="profile-picture-upload"
        type="file"
        onChange={handleImageChange} />
        <label htmlFor="profile-picture-upload">
          <IconButton
             aria-label="upload picture"
            component="span"
          >
            <PhotoCameraIcon />
          </IconButton>
        </label></>} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
  <Avatar 
    src={selectedImage ? selectedImage.toString() : "/broken-image.jpg"} 
    sx={{ width: 70, height: 70, bottom: "0px",margin: "-5px"}} />
</Badge>


    <Container sx={{ backgroundColor: "white", margin: "20px", padding: "20px", height: "auto", width: "80%" ,borderRadius:"20px"}}>
        <Typography variant="h6" gutterBottom>LOGIN</Typography>
        <FormGroup >
       
        <FormControl sx={{ m: 1, width: '100%' }} variant="outlined" >
            <TextField id="outlined-basic" label="Email" variant="outlined"
            name='email' 
            value={userLogindetails.email} onChange={UserLoginDetails}
            type='email' fullWidth required placeholder='Email' sx={{ marginBottom: "10px" }} />
          </FormControl>
          <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput fullWidth 
            name="password"
            value={userLogindetails.password} onChange={UserLoginDetails}
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
             
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"

                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
            <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
           <Button variant="contained" sx={{backgroundColor:"#4070f4"}} onClick={submitLogindetails}>LOGIN</Button>
            </FormControl>
            <FormControl sx={{ m: 1, width: '100%',display:"flex",flexDirection:"row",justifyContent:"center"}} variant="outlined">
           <Typography variant='h6' fontSize='15px' fontWeight='bold' color="grey">you don't have an account ?</Typography>
           <Link to="/signup">
           <Typography variant='h6' fontSize='15px' fontWeight='bold' color="#4070f4">  SIGNUP</Typography>
           </Link>
            </FormControl>
        </FormGroup>
    </Container>
</Container>


  )
}

export default Login
