// @ts-check
const express = require("express");
const fs = require("fs");
const { Client, MessageMedia } = require("whatsapp-web.js");

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

app.listen(5555, () => console.log("Listening on port 5555"));

client.on("qr", (qr) => {
  app.get("/qr", (req, res) => {
    res.send(qr);
  });
  console.log("QR RECEIVED");
});

client.on("authenticated", (session) => {
  console.log("AUTHENTICATED", session);
  sessionCfg = session;
  fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
    if (err) {
      console.error(err);
    }
  });
});

client.on("auth_failure", (msg) => {
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
    /** @type {{ number: string; msg: string }} */
    const { number, msg } = req.body;
    client
      .sendMessage(`91${number}@c.us`, msg)
      .then(() => res.send("Message sent successfully"))
      .catch((err) => res.send(err).status(500));
  });

  app.post("/send-media", (req, res) => {
    /** @type {{ number: string; mimetype: string; base64: string }} */
    const { number, mimetype, base64 } = req.body;
    const media = new MessageMedia(mimetype, base64, Date.now().toString());
    client
      .sendMessage(`91${number}@c.us`, media)
      .then(() => res.send("Media sent successfully"))
      .catch((err) => res.send(err).status(500));
  });

  app.get("/logout", async (req, res) => {
    await client.logout();
    res.send("Logged out");
    fs.unlink(SESSION_FILE_PATH, () => console.log("Session deleted"));
    process.exit();
  });
});
