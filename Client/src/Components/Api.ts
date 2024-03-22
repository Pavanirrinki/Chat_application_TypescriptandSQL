import axios from "axios";
import { userdataProps } from "./Signup";
import { Loginprops } from "./Login";


export const API = `http://localhost:5001/`;

export const GetMessage = async (senderId: string, ReceiverId: string): Promise<string[]> => {
    try {
        const response = await axios.get(API + `allmessages/${senderId}/${ReceiverId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}

export const SignupApi = async (route :String,data:userdataProps ):Promise<String[]> =>{
         try {

        const response = await axios.post(`${API}${route}`,data);
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}

export const LoginApi = async (route :String,data:Loginprops,profile_pic:string | ArrayBuffer | null):Promise<String[]> =>{
    try {

   const response = await axios.post(`${API}${route}`,{data,profile_pic});
   return response.data;
} catch (error) {
   console.error('Error fetching messages:', error);
   throw error;
}
}
export const SendMessageApi =async (route:String,SenderId:String,ReceiverId:String,message:String):Promise<String[]> =>{
    try {
        console.log(route,SenderId,ReceiverId,message)
        const response = await axios.post(`${API}${route}`,{SenderId,ReceiverId,message});
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', (error as Error).message);
        throw error;
    }
}