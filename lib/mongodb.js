import dns from "node:dns";
import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export function hasMongoURI() {
  return Boolean(process.env.MONGODB_URI);
}

function getMongoDnsServers() {
  const configuredServers = process.env.MONGODB_DNS_SERVERS
    ?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (configuredServers?.length) {
    return configuredServers;
  }

  return ["8.8.8.8", "1.1.1.1"];
}

function mergeQueryParams(txtRecords, originalUrl) {
  const params = new URLSearchParams();

  for (const group of txtRecords) {
    const record = group.join("");

    for (const [key, value] of new URLSearchParams(record)) {
      params.set(key, value);
    }
  }

  for (const [key, value] of originalUrl.searchParams.entries()) {
    params.set(key, value);
  }

  if (!params.has("tls") && !params.has("ssl")) {
    params.set("tls", "true");
  }

  return params.toString();
}

async function resolveSrvMongoUri(mongoUri) {
  if (!mongoUri.startsWith("mongodb+srv://")) {
    return mongoUri;
  }

  const parsedUrl = new URL(mongoUri);
  const resolver = new dns.promises.Resolver();
  resolver.setServers(getMongoDnsServers());

  const [srvRecords, txtRecords] = await Promise.all([
    resolver.resolveSrv(`_mongodb._tcp.${parsedUrl.hostname}`),
    resolver.resolveTxt(parsedUrl.hostname).catch((error) => {
      if (error?.code === "ENODATA" || error?.code === "ENOTFOUND") {
        return [];
      }

      throw error;
    }),
  ]);

  if (!srvRecords.length) {
    throw new Error(`No SRV records found for ${parsedUrl.hostname}.`);
  }

  const hostList = srvRecords
    .map((record) => `${record.name}:${record.port}`)
    .join(",");
  const authPart = parsedUrl.username
    ? `${parsedUrl.username}${parsedUrl.password ? `:${parsedUrl.password}` : ""}@`
    : "";
  const queryString = mergeQueryParams(txtRecords, parsedUrl);

  return `mongodb://${authPart}${hostList}${parsedUrl.pathname}${queryString ? `?${queryString}` : ""}`;
}

function getDatabaseName(mongoUri) {
  if (process.env.MONGODB_DB_NAME) {
    return process.env.MONGODB_DB_NAME;
  }

  try {
    const pathname = new URL(mongoUri).pathname.replace(/^\//, "");
    return pathname || undefined;
  } catch {
    return undefined;
  }
}

function buildMongoConfigError(error) {
  const details = ["MongoDB connection failed."];

  if (error?.message?.includes("querySrv ECONNREFUSED")) {
    details.push(
      "Your machine is refusing Atlas SRV DNS lookups for a mongodb+srv URI."
    );
    details.push(
      "Use the Atlas non-SRV connection string format or fix local DNS resolution for Node.js."
    );
  } else if (
    error?.message?.includes("IP that isn't whitelisted") ||
    error?.message?.includes("Could not connect to any servers in your MongoDB Atlas cluster")
  ) {
    details.push(
      "Atlas is rejecting the network path to the cluster."
    );
    details.push(
      "Add your current public IP in Atlas Network Access and confirm the cluster is reachable."
    );
  } else {
    details.push(
      "Check MONGODB_URI, Atlas Network Access, database user credentials, and whether your network allows DNS SRV lookups."
    );
  }

  return new Error(details.join(" "));
}

export async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing MONGODB_URI. Define it in your environment before starting the app."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Reuse one connection promise in development to avoid opening duplicates.
    cached.promise = resolveSrvMongoUri(mongoUri).then((resolvedMongoUri) =>
      mongoose.connect(resolvedMongoUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        dbName: getDatabaseName(resolvedMongoUri),
      })
    );
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;

    const configError = buildMongoConfigError(error);
    configError.cause = error;
    throw configError;
  }
}
