const express = require("express");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const { Client } = require("whatsapp-web.js");

const app = express();

app.use(express.json());

const SESSION_FILE_PATH = "./session.json";
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
  session: sessionCfg,
});

client.initialize();

client.on("qr", qr => {
  // NOTE: This event will not be fired if a session is specified.
  qrcode.generate(qr, { small: true });
  console.log("QR RECEIVED");
});

client.on("authenticated", session => {
  console.log("AUTHENTICATED");

  sessionCfg = session;

  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
    if (err) {
      console.error(err);
    }
  });

  app.post("/send-msg", (req, res) => {
    const { number, msg } = req.body;
    client.sendMessage(`91${number}@c.us`, msg).then(() => res.send(msg));
  });

  app.listen(3000, () => console.log("Listening on port 3000"));
});

client.on("auth_failure", msg => {
  // Fired if session restore was unsuccessfull
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
  console.log("Client is ready!");
});
