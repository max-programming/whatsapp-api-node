// require ./client.js
import express from "express";
import fs from "fs";
import qrcode from "qrcode-terminal";
import { client, setSessionCfg } from "./client";
const app = express();

app.use(express.json());

client.initialize();

client.on("qr", qr => {
  qrcode.generate(qr, { small: true });
  console.log("QR RECEIVED");
});

client.on("authenticated", session => {
  console.log("AUTHENTICATED");

  setSessionCfg(session);

  fs.writeFile("../session.json", JSON.stringify(session), err => {
    if (err) {
      console.error(err);
    }
  });
});

client.on("auth_failure", msg => {
  console.error("AUTHENTICATION FAILURE", msg);
  fs.writeFile(`../session.json`, "{}", function (err) {
    console.log(`Error ${err}`);
  });
});

client.on("ready", () => {
  console.log("Client is ready!");

  app.post("/send-msg", (req, res) => {
    const { number, msg } = req.body;
    client.sendMessage(`91${number}@c.us`, msg).then(() => res.send(msg));
  });

  app.get("/logout", async (req, res) => {
    await client.logout();

    fs.writeFile(`../session.json`, "{}", function (err) {
      console.log(`Error ${err}`);
    });

    res.send("User logged out");
  });

  app.listen(3000, () => console.log("Listening on port 3000"));
});
