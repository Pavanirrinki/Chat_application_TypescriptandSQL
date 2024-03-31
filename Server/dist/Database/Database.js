"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = void 0;
const oracledb_1 = __importDefault(require("oracledb"));
require("dotenv").config();
async function connectToDatabase() {
    try {
        const connection = await oracledb_1.default.getConnection({
            user: "SYSTEM",
            password: "pavankumar",
            connectString: "localhost:1521/XE"
        });
        console.log("data connected");
        return connection;
    }
    catch (error) {
        console.error("Error connecting to database:", error);
        throw error;
    }
}
exports.connectToDatabase = connectToDatabase;
