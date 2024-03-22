import jwt from "jsonwebtoken";
import express, { NextFunction } from "express";

interface JwtPayload {
    user: {
      id: string;
    };
    iat: number;
}

export default function Middleware(req: express.Request, res: express.Response, next: NextFunction) {
    try {
        const token = req.header("x-token");
        if (!token) {
            return res.status(400).send("Authorization Error");
        } else {
            let decode = jwt.verify(token, "jwtpassword") as JwtPayload;
           if(decode.user.id){
            next();
           }else{
            return res.status(500).send("Token not found")
           }
        }
    } catch (error) {
        return res.status(500).send("Internal Server error");
    }
}
