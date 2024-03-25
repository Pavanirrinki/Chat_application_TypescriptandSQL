import express from "express";
import { connectToDatabase } from "../Database/Database";
import { v4 as uuidv4 } from "uuid";
import ShortUniqueId from "short-unique-id";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import Middleware from "../MiddleWare/Middleware";
import fs from "fs";
import { OnlineUsers, io } from "../index";

const router = express();
router.use(bodyParser.json())
module.exports = function (emitter: any, onlineusers: OnlineUsers) {
  emitter.on("socketConnected", (socket: any) => {});

  // --------------------------------------------SIGNUP ROUTE---------------------------------------------------
  router.post("/Signup", async (req, res) => {
    const { first_name, last_name, email, mobile, passwords} =
      req.body;

    try {
      const connection = await connectToDatabase();

      const result: any = await connection.execute(
        `SELECT EMAIL FROM USERS_DATA WHERE EMAIL = :email`,
        [email]
      );

      if (result.rows.length > 0) {
        await connection.close();
        return res.send("User already exists");
      } else {
        const uuid = uuidv4();

        try {
          // Hashing password
          const hash = await bcrypt.hash(passwords, 10);

          await connection.execute(
            `
                    INSERT INTO USERS_DATA (ID, FIRST_NAME, LAST_NAME, EMAIL, PASSWORD, MOBILE, CREATED_AT)
                    VALUES (:uuid, :first_name, :last_name, :email, :hash, :mobile,SYSTIMESTAMP)`,
            { uuid, first_name, last_name, email, hash, mobile }
          );

          await connection.commit();
          await connection.close();

          return res.status(201).send("User created successfully");
        } catch (error) {
          console.error("Error inserting data into database:", error);
          await connection.rollback();
          await connection.close();
          return res.status(500).json({ error: "Internal server error" });
        }
      }
    } catch (error) {
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
      const connection = await connectToDatabase();
      const storeduserdata: any = await connection.execute(
        `SELECT * FROM USERS_DATA WHERE EMAIL = :email`,
        [email]
      );
      console.log("1");
      const foundArray = storeduserdata.rows[0];
      console.log("2");
      if (foundArray) {
        bcrypt.compare(password, foundArray[4], async function (err, result) {
          if (err) {
            throw new Error();
          } else {
            if (result) {
              if (profile_pic) {
                // Update profile_pic for the user
                await connection.execute(
                  `UPDATE USERS_DATA SET PROFILE_PIC=:profile_pic WHERE EMAIL = :email`,
                  [profile_pic, email]
                );
                await connection.commit();
                console.log("3");
              }

              let payload = {
                user: {
                  id: foundArray[0],
                },
              };
              jwt.sign(payload, "JWTPASSWORD", async (error, token) => {
                if (error) throw error;
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
            } else {
              res.status(400).send("Email or password wrong");
            }
          }
        });
      } else {
        res.status(400).send("Email wrong");
      }
    } catch (error) {
      return res.status(500).json({ error: (error as Error).message });
    }
  });

  //-------------------------------------------SEND MESSAGE---------------------------------------------------------------
  router.post("/sendmessage",async (req: express.Request, res: express.Response) => {
      const { SenderId, message, ReceiverId, statusId, status } = req.body;
       console.log(onlineusers, "receiverid");
      try {
        console.log(onlineusers[ReceiverId], "receiverid");
        const uid = await new ShortUniqueId({
          length: 5,
          dictionary: "number",
        });
        const uuid = await uid.rnd();
        const connection = await connectToDatabase();
        console.log("DATA");
        const SYS_DATE = Date.now();
        if (!statusId && !status) {
          const sendmessage = await connection.execute(
            `INSERT INTO MESSAGES_TABLE(ID,SENDERID,MESSAGE,CREATED_AT) VALUES
       (:uuid,:SenderId,:message,:SYS_DATE)`,
            { uuid, SenderId, message, SYS_DATE }
          );
          const chatting = await connection.execute(
            `INSERT INTO CHATTING_TABLE(MESSAGEID,SENDERID,RECEIVERID,MESSAGE,CREATED_AT) VALUES
       (:uuid,:SenderId,:ReceiverId,:message,:SYS_DATE)`,
            { uuid, SenderId, ReceiverId, message, SYS_DATE }
          );
        } else {
          const binaryData = Buffer.from(status, "utf-8");
          const Send_Reply_to_status = await connection.execute(
            `INSERT INTO CHATTING_TABLE
(MESSAGEID,SENDERID,RECEIVERID,MESSAGE,CREATED_AT,STATUSID,STATUS) VALUES
(:uuid,:SenderId,:ReceiverId,:message,:SYS_DATE,:statusId,:final_data)`,
            [
              uuid,
              SenderId,
              ReceiverId,
              message,
              SYS_DATE,
              statusId,
              binaryData,
            ]
          );
        }
        if (onlineusers[ReceiverId]) {
       
        io.to(onlineusers[ReceiverId]).emit("message",{
            message_id: uuid,
            sender_id: SenderId,
            receiver_id: ReceiverId,
            message: message,
            created_at: SYS_DATE,
            statusId:  null,
            lob_data: null,
        })
        }

        await connection.commit();

        await connection.close();

        return res.status(201).send("Messenge created successfully");
      } catch (err) {
        return res.status(500).json({ error: (err as Error).message });
      }
    }
  );

  //-----------------------------GET ALL MESSAGES-----------------------------------------------
  router.get("/allmessages/:senderId/:ReceiverId", async (req, res) => {
    try {
      const { senderId, ReceiverId } = req.params;
     
      const connection = await connectToDatabase();

      const personal_chatting: any = await connection.execute(
        `SELECT * FROM CHATTING_TABLE WHERE (SENDERID = :senderId AND RECEIVERID = :ReceiverId) OR 
                (SENDERID = :ReceiverId AND RECEIVERID = :senderId) ORDER BY CREATED_AT ASC`,
        [senderId, ReceiverId, ReceiverId, senderId]
      );

      const modified_data = [];

      for (const row of personal_chatting.rows) {
        let lob_data = null;

        if (row[6] !== null) {
          let data = "";
          await new Promise<void>((resolve, reject) => {
            row[6].on("data", (chunk: any) => {
              data += chunk;
            });
            row[6].on("end", () => {
              lob_data = data;
              resolve();
            });
            row[6].on("error", (err: Error) => {
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
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: (error as Error).message });
    }
  });

  //-----------------------------PROFILES OF ALL USERS-------------------------------------------------
  router.get("/user_data", async (req, res) => {
    try {
      const connection = await connectToDatabase();
      const data = await connection.execute(
        `SELECT ID,FIRST_NAME,LAST_NAME,EMAIL,PROFILE_PIC FROM USERS_DATA ORDER BY CREATED_AT DESC`
      );
      console.log(data.rows);

      res.send(data.rows);
    } catch (error) {
      return res.status(500).send("Internal server error");
    }
  });

  //----------------------------------------------------ADD STATUS ROUTE---------------------------

  router.post("/add_status", async (req, res) => {
  
    try {
      const { textData, user_id } = req.body;
     
      const binaryData = Buffer.from(textData, "utf-8");
      const uid = await new ShortUniqueId({
        length: 5,
        dictionary: "number",
      });
      const uuid = await uid.rnd();
      const connection = await connectToDatabase();
      const data = await connection.execute(
        `INSERT INTO STATUS_TABLE(STATUS_ID,USER_ID,STATUS,CREATED_AT,EXPIRED_AT) VALUES
        (:uuid,:user_id,:binaryData,SYSTIMESTAMP,SYSTIMESTAMP + INTERVAL '24' HOUR)`,
        [uuid, user_id, binaryData]
      );
      await connection.commit();
      await connection.close();

      res.status(200).send("Status Successfully Updated");
    } catch (error) {
      return res.status(500).send((error as Error).message);
    }
  });

  //-----------------------------GET PARTICULAR USER STATUS DATA------------------------------------------

  router.get("/get_status_data/:userid", async (req, res) => {
    try {
      const { userid } = req.params;
      const final_data: any[] = [];
      const connection = await connectToDatabase();
      const result: any = await connection.execute(
        `
            SELECT s.STATUS_ID, s.USER_ID, s.STATUS, s.CREATED_AT, u.FIRST_NAME, u.LAST_NAME, u.PROFILE_PIC
            FROM STATUS_TABLE s
            INNER JOIN USERS_DATA u ON s.USER_ID = u.ID
            WHERE s.EXPIRED_AT > SYSTIMESTAMP AND s.USER_ID = :userid
        `,
        [userid]
      );

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
          lobData.on("data", (chunk: any) => {
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
          lobData.on("error", (err: Error) => {
            console.error("Error reading Lob:", err); // Log any errors
            res.status(500).send("Error reading Lob.");
          });
        }
      } else {
        console.log("No data returned from the query."); // Log if no data is returned
        res.status(404).send("No data found.");
      }
    } catch (error) {
      console.error("Error:", error); // Log any errors that occur
      res.status(500).send((error as Error).message);
    }
  });

  //--------------------------------------STATUS PROFILES-------------------------------------
  router.get("/status_profiles", async (req, res) => {
    try {
      const connection = await connectToDatabase();
      const result =
        await connection.execute(`SELECT ID,FIRST_NAME,LAST_NAME,PROFILE_PIC FROM USERS_DATA
            WHERE ID IN (SELECT DISTINCT USER_ID FROM STATUS_TABLE WHERE EXPIRED_AT > SYSTIMESTAMP) `);
      await connection.close();
      res.status(200).send(result.rows);
    } catch (error) {
      return res.status(500).send((error as Error).message);
    }
  });


  //-------------------------------CREATE GROUP---------------------------------------------------
  router.post("/create_group",async(req,res)=>{
    try{
     const {groupname,created_by} =req.body;
     const connection = connectToDatabase();
     const uid = await new ShortUniqueId({
      length: 6,
      dictionary: "number",
    });
    const groupId = await uid.rnd();
     const create_group = (await connection).execute(`INSERT INTO GROUPS_TABLE(GROUPID,GROUPNAME,CREATED_BY,CREATED_AT) VALUES 
     (:groupId,:groupname,:created_by,SYSTIMESTAMP)`,{groupId,groupname,created_by});
     const add_member_to_group =  (await connection).execute(`INSERT INTO USERS_IN_GROUPS(ID,USERID) VALUES(:groupId,:created_by)`,{groupId,created_by});
     (await connection).commit();
     (await connection).close();
     return res.status(200).send("SUCCESSFULLY CREATED GROUP");

    }catch(error){
      return res.status(500).send({error:(error as Error).message});
    }
  })
  //-------------------------ALL GROUPS OF PARTICULAR USER------------------------------------------------------
  router.get("/all_groups_in_user/:userid", async (req, res) => {
    try {
        const { userid } = req.params;
        const connection = await connectToDatabase();
        const result = await connection.execute(`
            SELECT *
            FROM GROUPS_TABLE t1
            INNER JOIN USERS_IN_GROUPS t2 ON t1.GROUPID = t2.ID
            WHERE t2.USERID = :userid`, 
            { userid }
        );
        await connection.close();
        
        if (result.rows && result.rows.length > 0) {
            const response = result.rows.map((row:any) => ({
                groupId: row[0], 
                groupName: row[1], 
                created_by: row[2],
                profile_pic:row[4]
            }));
            return res.status(200).send(response);
        }
    } catch (error) {
        return res.status(500).send({ error:(error as Error).message });
    }
});

// -------------------------ALL USERS OF PARTICULAR GROUP--------------------------------------------------------
router.get("/users_in_group/:groupId",async(req,res)=>{
  const {groupId} = req.params;
  try{
const connection = await connectToDatabase();
const result = await connection.execute(`SELECT * FROM USERS_IN_GROUPS WHERE ID = :groupId`,{groupId});
await connection.close();
return res.status(200).send(result.rows)
  }catch(error){
    return res.status(500).send({error:(error as Error).message})
  }
})

//--------------------------------ADD PROFIILES TO GROUP-------------------------------------------
router.post("/add_members_to_group/:groupId",async(req,res)=>{
 const {profiles} = req.body;
 const {groupId} = req.params;
 const connection =await connectToDatabase();
  profiles.map(async (data: any)=>{
    console.log(groupId,data,"ffff");
    // const add_member_to_group =  (await connection).execute(`INSERT INTO USERS_IN_GROUPS(ID,USERID) VALUES(:groupId,:created_by)`,{groupId,data});
  })
})
  return router;
};
