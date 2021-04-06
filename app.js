// @ts-check
const express = require("express");
const fs = require("fs");
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const app = express();

app.use(express.json());

const SESSION_FILE_PATH = "./session.json";
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
  puppeteer: { headless: false },
  session: sessionCfg,
});

client.initialize();

client.on("qr", qr => {
  qrcode.generate(qr, { small: true });
  console.log("QR RECEIVED");
});

client.on("authenticated", session => {
  console.log("AUTHENTICATED", session);
  sessionCfg = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
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

  app.get("/", (req, res) => {
    res.send("Hiii!");
  });

  app.post("/send-msg", (req, res) => {
    const { number, msg } = req.body;
    client.sendMessage(`91${number}@c.us`, msg).then(() => res.send(msg));
  });

  app.get("/logout", async (req, res) => {
    await client.logout();
    fs.unlink(SESSION_FILE_PATH, () => console.log("Session deleted"));
    process.exit();
  });

  app.listen(3000, () => console.log("Listening on port 3000"));
});
