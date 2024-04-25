import React from 'react'
import { useParams } from 'react-router-dom'
function VideoCalling() {
    const {id} = useParams();
  return (
    <div>{id}</div>
  )
}

export default VideoCalling