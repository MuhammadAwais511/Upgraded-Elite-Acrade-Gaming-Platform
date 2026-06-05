import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

const dataDirectory = path.join(process.cwd(), ".data");
const usersFile = path.join(dataDirectory, "users.json");

async function ensureUsersFile() {
  try {
    await fs.mkdir(dataDirectory, { recursive: true });
    await fs.access(usersFile);
  } catch {
    await fs.writeFile(usersFile, "[]", "utf8");
  }
}

async function readUsers(): Promise<UserRecord[]> {
  await ensureUsersFile();
  const raw = await fs.readFile(usersFile, "utf8");
  try {
    return JSON.parse(raw) as UserRecord[];
  } catch {
    return [];
  }
}

async function writeUsers(users: UserRecord[]) {
  await ensureUsersFile();
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
}

function hashPassword(password: string, salt: string) {
  return crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256").toString("hex");
}

export async function getUserByEmail(email: string) {
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUser({ name, email, password }: { name: string; email: string; password: string; }) {
  const users = await readUsers();
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const user: UserRecord = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return user;
}

export async function validateUser(email: string, password: string) {
  const user = await getUserByEmail(email.toLowerCase());
  if (!user) return null;
  const testHash = hashPassword(password, user.salt);
  return user.passwordHash === testHash ? user : null;
}
