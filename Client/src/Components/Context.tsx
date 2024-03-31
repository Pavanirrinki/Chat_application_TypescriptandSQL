import React, { createContext, useEffect, useState } from "react";
import { GetMessage } from "./Api";
import io from 'socket.io-client';
import { useLocation } from "react-router-dom";

const ChatContext = createContext<any>(null);

interface OnlineUsers {
  [key: string]: string;
}

function Context({ children }: { children: React.ReactNode }) {
  const [usersStatusData, setUsersStatusData] = useState<string | null>(null);
  const [onlineusers, setOnlineusers] = useState<OnlineUsers | null>(null);
  const user_data = localStorage.getItem("Chat_user_details");
  const parsed_data = user_data && JSON.parse(user_data);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Establish the socket connection once
    const socket = io("http://localhost:5001/", {
      query: {
        userId: parsed_data?.sendeddata?.userId,
      },
    });

    // Listen for 'custom_socket' event to update online users
    socket.on("custom_socket", (data: any) => {
      setOnlineusers(data.message);
    });

    // Store the socket instance
    setSocket(socket);

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [parsed_data?.sendeddata?.userId,window.location.pathname]);

  return (
    <ChatContext.Provider value={{ usersStatusData, setUsersStatusData, onlineusers, socket }}>
      {children}
    </ChatContext.Provider>
  );
}

export { ChatContext, Context };
