const fs = require("fs");
const path = require("path");
const dns = require("node:dns");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
  const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!uri) {
    throw new Error("Missing MONGODB_URI.");
  }

  if (!password || password.length < 8) {
    throw new Error("Set ADMIN_PASSWORD with at least 8 characters before running seed:admin.");
  }

  if (uri.startsWith("mongodb+srv://")) {
    const dnsServers = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    dns.setServers(dnsServers);
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    dbName: process.env.MONGODB_DB_NAME || undefined,
  });

  const userSchema = new mongoose.Schema(
    {
      username: String,
      password: String,
      role: String,
      isActive: Boolean,
    },
    { timestamps: true, versionKey: false }
  );

  const User = mongoose.models.User || mongoose.model("User", userSchema);
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    existingUser.password = await bcrypt.hash(password, 12);
    existingUser.role = "admin";
    existingUser.isActive = true;
    await existingUser.save();
    console.log(`Admin user "${username}" updated.`);
  } else {
    await User.create({
      username,
      password: await bcrypt.hash(password, 12),
      role: "admin",
      isActive: true,
    });
    console.log(`Admin user "${username}" created.`);
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
