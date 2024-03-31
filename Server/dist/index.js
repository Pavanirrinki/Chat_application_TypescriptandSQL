"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.eventEmitter = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const events_1 = require("events");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const multer_1 = __importDefault(require("multer"));
const path = require("path");
const fs = require("fs");
const app = (0, express_1.default)();
exports.eventEmitter = new events_1.EventEmitter();
const server = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
app.use(body_parser_1.default.json({ limit: '10mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cors_1.default)({
    origin: "*"
}));
app.use(express_1.default.json());
let onlineusers = {};
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../Client/src/Components/uploads/"));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}_${file.originalname}`;
        console.log("Generated filename:", fileName); // Log the generated filename
        cb(null, fileName);
    }
});
const upload = (0, multer_1.default)({ storage });
exports.io.on('connection', (socket) => {
    console.log('A user connected');
    if (typeof socket.handshake.query.userId === 'string' && socket.handshake.query.userId !== "undefined") {
        onlineusers[socket.handshake.query.userId] = socket.id;
    }
    socket.on("join Room", (data) => {
        socket.join(data); // Join the room corresponding to the group
    });
    socket.on("groupmessage", (msg) => {
        console.log("chat messag", msg);
        exports.io.to(msg.groupId).emit('chat message', { message: msg.message, groupID: msg.groupId });
    });
    console.log(onlineusers, 'pol');
    exports.io.emit("custom_socket", { message: onlineusers });
    socket.on("Typing", (data) => {
        exports.io.to(onlineusers[data]).emit("Typingstarted", "Typing");
    });
    socket.on("Typingstopped", (data) => {
        exports.io.to(onlineusers[data]).emit("Typingstop", "Typingstopped");
    });
    console.log('Socket connected in UserRoute component');
    exports.eventEmitter.emit('socketConnected', socket);
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        for (const userId in onlineusers) {
            if (Object.prototype.hasOwnProperty.call(onlineusers, userId) && onlineusers[userId] === socket.id) {
                delete onlineusers[userId];
                exports.io.emit("custom_socket", { message: onlineusers });
                break;
            }
        }
        console.log(onlineusers, 'pol');
    });
});
const port = process.env.PORT || 5001;
const userRouter = require('./Routes/UserRoutes')(exports.eventEmitter, onlineusers);
app.use("/", userRouter);
app.get("/", (req, res) => {
    res.send("Hello world");
});
app.post("/uploads", upload.single("file"), async (req, res) => {
    var _a;
    console.log(req.body);
    console.log(req.file, "req.files req.files");
    res.status(200).json((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename);
});
server.listen(port, () => {
    console.log(`Server started successfully on port: ${port}`);
});
