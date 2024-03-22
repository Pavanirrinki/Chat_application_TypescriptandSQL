import { Box, Button, Container, FormControl, FormGroup, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, Navigate } from 'react-router-dom';
import { SignupApi } from './Api';
import { useNavigate } from 'react-router-dom';

export interface userdataProps {
  first_name: String,
  last_name: String,
  email: String,
  passwords: String,
  mobile: Number
}

function Signup(): JSX.Element {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [userdata, setUserdata] = useState<userdataProps>({
    first_name: "",
    last_name: '',
    email: "",
    passwords: "",
    mobile: 0
  })

  const EnterUserDetails =(e:React.ChangeEvent<HTMLInputElement>) =>{
    const { name, value } = e.target;
    setUserdata((prevUserData) => ({
      ...prevUserData,
      [name]: value
    }));

  }

  const submituserdata =(e:React.MouseEvent<HTMLButtonElement>) =>{
    e.preventDefault();
   SignupApi("Signup",userdata).then(data => navigate("/login"))
   .catch(error => console.error('Error:', error.message));
  }
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  return (
    <Container maxWidth="sm" sx={{ backgroundColor: "#4070f4", height: "100vh", display: 'flex', justifyContent: 'center', alignItems: "center", borderRadius: "20px" }}>
      <Container sx={{ backgroundColor: "white", margin: "20px", padding: "20px", height: "auto", width: "80%", borderRadius: "20px" }}>
        <Typography variant="h6" gutterBottom>Registration</Typography>
        <FormGroup >
          <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
            <TextField id="outlined-basic" label="First Name" variant="outlined"
            name='first_name' 
            value={userdata.first_name} onChange={EnterUserDetails}
            type="text" fullWidth required placeholder='First Name' sx={{ marginBottom: "10px" }} />
          </FormControl>
          <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
            <TextField id="outlined-basic" label="Last Name" variant="outlined" 
            name='last_name'
            value={userdata.last_name} onChange={EnterUserDetails}
            type="text" fullWidth required placeholder='Last Name' sx={{ marginBottom: "10px" }} />
          </FormControl>
          <FormControl sx={{ m: 1, width: '100%' }} variant="outlined" >
            <TextField id="outlined-basic" label="Email" variant="outlined"
            name='email' 
            value={userdata.email} onChange={EnterUserDetails}
            type='email' fullWidth required placeholder='Email' sx={{ marginBottom: "10px" }} />
          </FormControl>
          <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput fullWidth 
            name="passwords"
            value={userdata.passwords} onChange={EnterUserDetails}
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
            <TextField id="outlined-basic" label="Mobile Number" type="tel" 
            name="mobile"
            value={userdata.mobile} onChange={EnterUserDetails}
              variant="outlined" fullWidth required placeholder='Mobile Number' sx={{ marginBottom: "10px" }} />
          </FormControl>
          <FormControl sx={{ m: 1, width: '100%' }} variant="outlined">
            <Button variant="contained" sx={{ backgroundColor: "#4070f4" }} onClick={submituserdata}>Register</Button>
          </FormControl>
          <FormControl sx={{ m: 1, width: '100%', display: "flex", flexDirection: "row", justifyContent: "center" }} variant="outlined">
            <Typography variant='h6' fontSize='15px' fontWeight='bold' color="grey">Already have an account ?</Typography>
            <Link to='/login'>
              <Typography variant='h6' fontSize='15px' fontWeight='bold' color="#4070f4">  LOGIN</Typography>
            </Link>
          </FormControl>
        </FormGroup>
      </Container>
    </Container>


  )
}

export default Signup
