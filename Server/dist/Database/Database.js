"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = void 0;
const oracledb_1 = __importDefault(require("oracledb"));
require("dotenv").config();
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield oracledb_1.default.getConnection({
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
    });
}
exports.connectToDatabase = connectToDatabase;
//# sourceMappingURL=Database.js.map