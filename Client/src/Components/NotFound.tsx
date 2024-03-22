import { Box, Container, Paper, Typography } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

function NotFound(): JSX.Element  {
  return (
   <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }} >
    <Paper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '100px',borderRadius:"10px" }} 
    elevation={10} >
        <Typography variant='h6' margin={2} fontWeight='bold'>Not Found</Typography>
        <Box display='flex' gap={2}>
            <Typography variant='subtitle1'>Go To</Typography>
        <Link to="/">
     <Typography>Home</Typography>
        </Link>
        </Box>
    </Paper>
</Container>

  )
}

export default NotFound
