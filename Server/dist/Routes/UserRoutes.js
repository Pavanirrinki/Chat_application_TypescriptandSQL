"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Database_1 = require("../Database/Database");
const uuid_1 = require("uuid");
const short_unique_id_1 = __importDefault(require("short-unique-id"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const body_parser_1 = __importDefault(require("body-parser"));
const index_1 = require("../index");
const router = (0, express_1.default)();
router.use(body_parser_1.default.json());
module.exports = function (emitter, onlineusers) {
    emitter.on("socketConnected", (socket) => { });
    // --------------------------------------------SIGNUP ROUTE---------------------------------------------------
    router.post("/Signup", async (req, res) => {
        const { first_name, last_name, email, mobile, passwords } = req.body;
        try {
            const connection = await (0, Database_1.connectToDatabase)();
            const result = await connection.execute(`SELECT EMAIL FROM USERS_DATA WHERE EMAIL = :email`, [email]);
            if (result.rows.length > 0) {
                await connection.close();
                return res.send("User already exists");
            }
            else {
                const uuid = (0, uuid_1.v4)();
                try {
                    // Hashing password
                    const hash = await bcrypt_1.default.hash(passwords, 10);
                    await connection.execute(`
                    INSERT INTO USERS_DATA (ID, FIRST_NAME, LAST_NAME, EMAIL, PASSWORD, MOBILE, CREATED_AT)
                    VALUES (:uuid, :first_name, :last_name, :email, :hash, :mobile,SYSTIMESTAMP)`, { uuid, first_name, last_name, email, hash, mobile });
                    await connection.commit();
                    await connection.close();
                    return res.status(201).send("User created successfully");
                }
                catch (error) {
                    console.error("Error inserting data into database:", error);
                    await connection.rollback();
                    await connection.close();
                    return res.status(500).json({ error: "Internal server error" });
                }
            }
        }
        catch (error) {
            console.error("Error handling request:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
    //-------------------------------LOGIN ROUTE----------------------------------------------------------------------
    router.post("/userlogin", async (req, res) => {
        try {
            const { email, password } = req.body.data;
            const { profile_pic } = req.body;
            console.log(email, password, profile_pic, "profilepic");
            const connection = await (0, Database_1.connectToDatabase)();
            const storeduserdata = await connection.execute(`SELECT * FROM USERS_DATA WHERE EMAIL = :email`, [email]);
            console.log("1");
            const foundArray = storeduserdata.rows[0];
            console.log("2");
            if (foundArray) {
                bcrypt_1.default.compare(password, foundArray[4], async function (err, result) {
                    if (err) {
                        throw new Error();
                    }
                    else {
                        if (result) {
                            if (profile_pic) {
                                // Update profile_pic for the user
                                await connection.execute(`UPDATE USERS_DATA SET PROFILE_PIC=:profile_pic WHERE EMAIL = :email`, [profile_pic, email]);
                                await connection.commit();
                                console.log("3");
                            }
                            let payload = {
                                user: {
                                    id: foundArray[0],
                                },
                            };
                            jsonwebtoken_1.default.sign(payload, "JWTPASSWORD", async (error, token) => {
                                if (error)
                                    throw error;
                                const sendeddata = {
                                    userId: foundArray[0],
                                    first_name: foundArray[1],
                                    last_name: foundArray[2],
                                    email: foundArray[3],
                                    mobile: foundArray[5],
                                    profile_pic: foundArray[6],
                                };
                                await connection.close();
                                return res.json({ token, sendeddata });
                            });
                        }
                        else {
                            res.status(400).send("Email or password wrong");
                        }
                    }
                });
            }
            else {
                res.status(400).send("Email wrong");
            }
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });
    //-------------------------------------------SEND MESSAGE---------------------------------------------------------------
    router.post("/sendmessage", async (req, res) => {
        const { SenderId, message, ReceiverId, statusId, status } = req.body;
        console.log(onlineusers, "receiverid");
        try {
            console.log(onlineusers[ReceiverId], "receiverid");
            const uid = await new short_unique_id_1.default({
                length: 5,
                dictionary: "number",
            });
            const uuid = await uid.rnd();
            const connection = await (0, Database_1.connectToDatabase)();
            console.log("DATA");
            const SYS_DATE = Date.now();
            if (!statusId && !status) {
                const sendmessage = await connection.execute(`INSERT INTO MESSAGES_TABLE(ID,SENDERID,MESSAGE,CREATED_AT) VALUES
       (:uuid,:SenderId,:message,:SYS_DATE)`, { uuid, SenderId, message, SYS_DATE });
                const chatting = await connection.execute(`INSERT INTO CHATTING_TABLE(MESSAGEID,SENDERID,RECEIVERID,MESSAGE,CREATED_AT) VALUES
       (:uuid,:SenderId,:ReceiverId,:message,:SYS_DATE)`, { uuid, SenderId, ReceiverId, message, SYS_DATE });
            }
            else {
                const binaryData = Buffer.from(status, "utf-8");
                const Send_Reply_to_status = await connection.execute(`INSERT INTO CHATTING_TABLE
(MESSAGEID,SENDERID,RECEIVERID,MESSAGE,CREATED_AT,STATUSID,STATUS) VALUES
(:uuid,:SenderId,:ReceiverId,:message,:SYS_DATE,:statusId,:final_data)`, [
                    uuid,
                    SenderId,
                    ReceiverId,
                    message,
                    SYS_DATE,
                    statusId,
                    binaryData,
                ]);
            }
            if (onlineusers[ReceiverId]) {
                index_1.io.to(onlineusers[ReceiverId]).emit("message", {
                    message_id: uuid,
                    sender_id: SenderId,
                    receiver_id: ReceiverId,
                    message: message,
                    created_at: SYS_DATE,
                    statusId: null,
                    lob_data: null,
                });
            }
            await connection.commit();
            await connection.close();
            return res.status(201).send("Messenge created successfully");
        }
        catch (err) {
            return res.status(500).json({ error: err.message });
        }
    });
    //-----------------------------GET ALL MESSAGES-----------------------------------------------
    router.get("/allmessages/:senderId/:ReceiverId", async (req, res) => {
        try {
            const { senderId, ReceiverId } = req.params;
            const connection = await (0, Database_1.connectToDatabase)();
            const personal_chatting = await connection.execute(`SELECT * FROM CHATTING_TABLE WHERE (SENDERID = :senderId AND RECEIVERID = :ReceiverId) OR 
                (SENDERID = :ReceiverId AND RECEIVERID = :senderId) ORDER BY CREATED_AT ASC`, [senderId, ReceiverId, ReceiverId, senderId]);
            const modified_data = [];
            for (const row of personal_chatting.rows) {
                let lob_data = null;
                if (row[6] !== null) {
                    let data = "";
                    await new Promise((resolve, reject) => {
                        row[6].on("data", (chunk) => {
                            data += chunk;
                        });
                        row[6].on("end", () => {
                            lob_data = data;
                            resolve();
                        });
                        row[6].on("error", (err) => {
                            reject(err);
                        });
                    });
                }
                modified_data.push({
                    message_id: row[0],
                    sender_id: row[1],
                    receiver_id: row[2],
                    message: row[3],
                    created_at: row[4],
                    statusId: row[5] ? row[5] : null,
                    lob_data: lob_data,
                });
            }
            await connection.close();
            return res.status(200).send(modified_data);
        }
        catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ error: error.message });
        }
    });
    //-----------------------------PROFILES OF ALL USERS-------------------------------------------------
    router.get("/user_data", async (req, res) => {
        try {
            const connection = await (0, Database_1.connectToDatabase)();
            const data = await connection.execute(`SELECT ID,FIRST_NAME,LAST_NAME,EMAIL,PROFILE_PIC FROM USERS_DATA ORDER BY CREATED_AT DESC`);
            console.log(data.rows);
            res.send(data.rows);
        }
        catch (error) {
            return res.status(500).send("Internal server error");
        }
    });
    //----------------------------------------------------ADD STATUS ROUTE---------------------------
    router.post("/add_status", async (req, res) => {
        try {
            const { textData, user_id } = req.body;
            const binaryData = Buffer.from(textData, "utf-8");
            const uid = await new short_unique_id_1.default({
                length: 5,
                dictionary: "number",
            });
            const uuid = await uid.rnd();
            const connection = await (0, Database_1.connectToDatabase)();
            const data = await connection.execute(`INSERT INTO STATUS_TABLE(STATUS_ID,USER_ID,STATUS,CREATED_AT,EXPIRED_AT) VALUES
        (:uuid,:user_id,:binaryData,SYSTIMESTAMP,SYSTIMESTAMP + INTERVAL '24' HOUR)`, [uuid, user_id, binaryData]);
            await connection.commit();
            await connection.close();
            res.status(200).send("Status Successfully Updated");
        }
        catch (error) {
            return res.status(500).send(error.message);
        }
    });
    //-----------------------------GET PARTICULAR USER STATUS DATA------------------------------------------
    router.get("/get_status_data/:userid", async (req, res) => {
        try {
            const { userid } = req.params;
            const final_data = [];
            const connection = await (0, Database_1.connectToDatabase)();
            const result = await connection.execute(`
            SELECT s.STATUS_ID, s.USER_ID, s.STATUS, s.CREATED_AT, u.FIRST_NAME, u.LAST_NAME, u.PROFILE_PIC
            FROM STATUS_TABLE s
            INNER JOIN USERS_DATA u ON s.USER_ID = u.ID
            WHERE s.EXPIRED_AT > SYSTIMESTAMP AND s.USER_ID = :userid
        `, [userid]);
            // Check if result.rows is not empty
            if (result && result.rows.length > 0) {
                for (const row of result.rows) {
                    const statusId = row[0];
                    const userId = row[1];
                    const createdAt = row[3];
                    const lobData = row[2];
                    // Read the Lob data and convert it to a string
                    let data = "";
                    lobData.setEncoding("utf8"); // Set the encoding
                    lobData.on("data", (chunk) => {
                        data += chunk;
                    });
                    lobData.on("end", () => {
                        // Push an object containing status details
                        final_data.push({ status: data, statusId, userId, createdAt });
                        // If all rows have been processed, send the response
                        if (final_data.length === result.rows.length) {
                            res.status(200).send(final_data);
                        }
                    });
                    lobData.on("error", (err) => {
                        console.error("Error reading Lob:", err); // Log any errors
                        res.status(500).send("Error reading Lob.");
                    });
                }
            }
            else {
                console.log("No data returned from the query."); // Log if no data is returned
                res.status(404).send("No data found.");
            }
        }
        catch (error) {
            console.error("Error:", error); // Log any errors that occur
            res.status(500).send(error.message);
        }
    });
    //--------------------------------------STATUS PROFILES-------------------------------------
    router.get("/status_profiles", async (req, res) => {
        try {
            const connection = await (0, Database_1.connectToDatabase)();
            const result = await connection.execute(`SELECT ID,FIRST_NAME,LAST_NAME,PROFILE_PIC FROM USERS_DATA
            WHERE ID IN (SELECT DISTINCT USER_ID FROM STATUS_TABLE WHERE EXPIRED_AT > SYSTIMESTAMP) `);
            await connection.close();
            res.status(200).send(result.rows);
        }
        catch (error) {
            return res.status(500).send(error.message);
        }
    });
    //-------------------------------CREATE GROUP---------------------------------------------------
    router.post("/create_group", async (req, res) => {
        try {
            const { groupname, created_by } = req.body;
            const connection = (0, Database_1.connectToDatabase)();
            const uid = await new short_unique_id_1.default({
                length: 6,
                dictionary: "number",
            });
            const groupId = await uid.rnd();
            const create_group = (await connection).execute(`INSERT INTO GROUPS_TABLE(GROUPID,GROUPNAME,CREATED_BY,CREATED_AT) VALUES 
     (:groupId,:groupname,:created_by,SYSTIMESTAMP)`, { groupId, groupname, created_by });
            const add_member_to_group = (await connection).execute(`INSERT INTO USERS_IN_GROUPS(ID,USERID) VALUES(:groupId,:created_by)`, { groupId, created_by });
            (await connection).commit();
            (await connection).close();
            return res.status(200).send("SUCCESSFULLY CREATED GROUP");
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
    //-------------------------ALL GROUPS OF PARTICULAR USER------------------------------------------------------
    router.get("/all_groups_in_user/:userid", async (req, res) => {
        try {
            const { userid } = req.params;
            const connection = await (0, Database_1.connectToDatabase)();
            const result = await connection.execute(`
            SELECT *
            FROM GROUPS_TABLE t1
            INNER JOIN USERS_IN_GROUPS t2 ON t1.GROUPID = t2.ID
            WHERE t2.USERID = :userid`, { userid });
            await connection.close();
            if (result.rows && result.rows.length > 0) {
                const response = result.rows.map((row) => ({
                    groupId: row[0],
                    groupName: row[1],
                    created_by: row[2],
                    profile_pic: row[4],
                }));
                return res.status(200).send(response);
            }
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
    // -------------------------ALL USERS OF PARTICULAR GROUP--------------------------------------------------------
    router.get("/users_in_group/:groupId", async (req, res) => {
        const { groupId } = req.params;
        try {
            const connection = await (0, Database_1.connectToDatabase)();
            const result = await connection.execute(`SELECT * FROM USERS_IN_GROUPS WHERE ID = :groupId`, { groupId });
            await connection.close();
            return res.status(200).send(result.rows);
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
    //--------------------------------ADD PROFIILES TO GROUP-------------------------------------------
    router.post("/add_members_to_group/:groupId", async (req, res) => {
        try {
            const { profiles } = req.body;
            const { groupId } = req.params;
            const connection = await (0, Database_1.connectToDatabase)();
            profiles.map(async (data) => {
                console.log(groupId, data, "ffff");
                const add_member_to_group = (await connection).execute(`INSERT INTO USERS_IN_GROUPS(ID,USERID) VALUES(:groupId,:created_by)`, { groupId, created_by: data });
                await connection.commit();
                await connection.close();
            });
            return res.status(200).send("Profiles Added To Group Successfully");
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
    //-----------------------------------GET GROUP DATA-----------------------------------------------
    router.get("/group_data/:groupId", async (req, res) => {
        try {
            const { groupId } = req.params;
            const connection = await (0, Database_1.connectToDatabase)();
            const group_data = await connection.execute(`SELECT *  FROM GROUPS_TABLE WHERE GROUPID=:groupId`, [groupId]);
            const group_messages = await connection.execute(`SELECT * FROM users_data
     INNER JOIN messeges_in_group_table ON users_data.ID = messeges_in_group_table.SENDERID where 
     messeges_in_group_table.GROUPID =:groupId ORDER BY messeges_in_group_table.CREATED_AT
     `, [groupId]);
            const count_of_users = await connection.execute(`SELECT COUNT(*) FROM USERS_IN_GROUPS WHERE ID=:groupId`, [groupId]);
            await connection.close();
            return res
                .status(200)
                .send({
                groupData: group_data.rows,
                groupMessages: group_messages.rows,
                count: count_of_users.rows,
            });
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
    //----------------------------SEND MESSAGE TO GROUP-----------------------------------------------
    router.post("/add_message_to_group/:groupId", async (req, res) => {
        try {
            const { senderId, message } = req.body;
            const { groupId } = req.params;
            const connection = await (0, Database_1.connectToDatabase)();
            const add_message_to_group = await connection.execute(`INSERT INTO MESSEGES_IN_GROUP_TABLE(GROUPID,SENDERID,MESSAGE,CREATED_AT) 
        VALUES(:groupId,:senderId,:message,SYSTIMESTAMP)`, { groupId, senderId, message });
            await connection.commit();
            await connection.close();
            return res.status(200).send("Message Sended to Group");
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
    //-----------------------------------------PROFILES DISPLAY NOT PRESENT IN GROUP--------------------------------
    router.get("/profiles_display_not_present_in_group/:groupId", async (req, res) => {
        try {
            const { groupId } = req.params;
            const connection = await (0, Database_1.connectToDatabase)();
            const users_not_their_in_group = await connection.execute(`select * from users_data left join users_in_groups 
     on users_data.ID = users_in_groups.USERID WHERE users_in_groups.ID =:groupId`, { groupId });
            connection.close();
            return res.status(200).send(users_not_their_in_group.rows);
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
    //-----------------------------------------------ADD TO FAVOURITE--------------------------------------
    router.post("/profiles_add_to_groups", async (req, res) => {
        try {
            const { groupId, userId } = req.body;
            if (!groupId || !userId) {
                return res.status(400).send("Both groupId and userId are required.");
            }
            const connection = await (0, Database_1.connectToDatabase)();
            const group_add_to_favourite = await connection.execute(`INSERT INTO FAVOURITE_GROUPS_TABLE (GROUPID,USERID)VALUES(:groupId,:userId)`, [groupId, userId]);
            await connection.commit();
            await connection.close();
            return res.status(200).send("Group Successfully Added To your Group");
        }
        catch (error) {
            console.error("Error adding group to favorite:", error);
            return res.status(500).send({ error: error.message || "Internal Server Error" });
        }
    });
    //-------------------------------------GET USER FAVOURITE GROUPS---------------------------------------
    router.get("/favourite_groups/:userId", async (req, res) => {
        try {
            const { userId } = req.params;
            const connection = await (0, Database_1.connectToDatabase)();
            const favourite_groups = await connection.execute(`
     select * from groups_table inner join favourite_groups_table on 
     groups_table.groupID = favourite_groups_table.groupid 
     WHERE favourite_groups_table.userid = :userId`, { userId });
            await connection.close();
            return res.status(200).send(favourite_groups.rows);
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
    //-------------------DELETE FAVOURITE GROUP---------------------------------------------------------
    router.delete("/delete_favourite_groups/:groupId/:userId", async (req, res) => {
        try {
            const { groupId, userId } = req.params;
            const connection = await (0, Database_1.connectToDatabase)();
            const favourite_groups = await connection.execute(`DELETE FROM FAVOURITE_GROUPS_TABLE  WHERE GROUPID =:groupId and USERID =:userId`, [groupId, userId]);
            await connection.commit();
            await connection.close();
            return res.status(200).send('Successfully Group Deleted From Favourites');
        }
        catch (error) {
            return res.status(500).send({ error: error.message });
        }
    });
    return router;
};
