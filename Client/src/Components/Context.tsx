import React, { createContext, useEffect, useState } from "react";
import { GetMessage } from "./Api";
import io from 'socket.io-client';
const ChatContext = createContext<any>(null);

function Context({ children }: { children: React.ReactNode }) {
  const [usersStatusData, setusersStatusData] = useState<String | null>(null);
  const [socket,setSocket] = useState<any>(io('http://localhost:5001/'))
useEffect(()=>{
   
},[])
  return (
    <ChatContext.Provider value={{ usersStatusData, setusersStatusData,socket,setSocket }}>
      {children}
    </ChatContext.Provider>
  );
}

export { ChatContext, Context };

