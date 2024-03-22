import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { EventEmitter } from "events";
import http from "http";
import { Server, Socket } from 'socket.io';
import multer, { Multer } from "multer";
const path = require("path");
const fs = require("fs");
const app = express();

export const eventEmitter = new EventEmitter();
const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: "*"
    }
});
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
    origin: "*"
  }));
app.use(express.json());
export interface OnlineUsers {
    [userId: string]: string; // Maps userId (string) to socket.id (string)
}
let onlineusers: OnlineUsers = {};



const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "../../Client/src/Components/uploads/"));
    },
    filename: function(req, file, cb) {
        const fileName = `${Date.now()}_${file.originalname}`;
        console.log("Generated filename:", fileName); // Log the generated filename
        cb(null, fileName);
    }
});
const upload = multer({storage});
io.on('connection', (socket) => {
    console.log('A user connected');

    if (typeof socket.handshake.query.userId === 'string' && socket.handshake.query.userId !== "undefined") {
        onlineusers[socket.handshake.query.userId] = socket.id;
    }

    console.log(onlineusers, 'pol');
    io.emit("custom_socket", { message: onlineusers });

    socket.on("Typing", (data: any) => {
        io.to(onlineusers[data]).emit("Typingstarted", "Typing");
    });

    socket.on("Typingstopped", (data: any) => {
        io.to(onlineusers[data]).emit("Typingstop", "Typingstopped");
    });

    console.log('Socket connected in UserRoute component');

    eventEmitter.emit('socketConnected', socket);


    socket.on('disconnect', () => {
        console.log('A user disconnected');

        for (const userId in onlineusers) {
            if (Object.prototype.hasOwnProperty.call(onlineusers, userId) && onlineusers[userId] === socket.id) {
                delete onlineusers[userId];
                io.emit("custom_socket", { message: onlineusers });
                break;
            }
        }
        console.log(onlineusers, 'pol');
    });
});

const port = process.env.PORT || 5001;


const userRouter = require('./Routes/UserRoutes')(eventEmitter, onlineusers);
app.use("/", userRouter);

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.post("/uploads",upload.single("file"),async(req,res)=>{
         console.log(req.body);
         console.log(req.file,"req.files req.files");
         res.status(200).json(req.file?.filename)
        
})

server.listen(port, () => {
    console.log(`Server started successfully on port: ${port}`);
});


