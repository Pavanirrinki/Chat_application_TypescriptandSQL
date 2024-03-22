import oracledb from "oracledb";
require("dotenv").config()

export async function connectToDatabase() {
   
    try {
        const connection = await oracledb.getConnection({
            user:"SYSTEM",
            password: "pavankumar",
            connectString:"localhost:1521/XE"
        });
        console.log("data connected");
        return connection;
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error;
    }
}
