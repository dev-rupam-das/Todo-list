const fs = require("fs");
const path = require("path");
const dns = require("node:dns");
const mongoose = require("mongoose");

function readEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  readEnvFile(".env.local");
  readEnvFile(".env");

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri) {
    throw new Error("Missing MONGODB_URI in .env.local, .env, or the shell environment.");
  }

  if (uri.startsWith("mongodb+srv://")) {
    const dnsServers = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    dns.setServers(dnsServers);
  }

  try {
    await mongoose.connect(
      uri,
      {
        serverSelectionTimeoutMS: 10000,
        dbName: dbName || undefined,
      }
    );

    console.log("Mongo connection OK");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Mongo connection failed.");
  console.error(error.message);

  if (error.message.includes("querySrv ECONNREFUSED")) {
    console.error(
      "Node.js cannot resolve Atlas SRV DNS records on this machine."
    );
    console.error(
      "Replace the mongodb+srv URI with the Atlas standard connection string that lists each host explicitly."
    );
  } else if (
    error.message.includes("IP that isn't whitelisted") ||
    error.message.includes("Could not connect to any servers in your MongoDB Atlas cluster")
  ) {
    console.error(
      "Atlas is blocking the connection path. Add your current public IP to Atlas Network Access."
    );
  }

  process.exit(1);
});
