"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function Middleware(req, res, next) {
    try {
        const token = req.header("x-token");
        if (!token) {
            return res.status(400).send("Authorization Error");
        }
        else {
            let decode = jsonwebtoken_1.default.verify(token, "jwtpassword");
            if (decode.user.id) {
                next();
            }
            else {
                return res.status(500).send("Token not found");
            }
        }
    }
    catch (error) {
        return res.status(500).send("Internal Server error");
    }
}
exports.default = Middleware;
//# sourceMappingURL=Middleware.js.map