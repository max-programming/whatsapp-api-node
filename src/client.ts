import fs from "fs";
import { Client, ClientSession } from "whatsapp-web.js";

const SESSION_FILE_PATH = `../session.json`;
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
  sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({
  session: sessionCfg,
});

const setSessionCfg = (session: ClientSession) => (sessionCfg = session);

export { client, setSessionCfg };
