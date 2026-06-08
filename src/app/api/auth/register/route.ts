import { createUser, getUserByEmail } from "../../../../lib/users"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return new Response(JSON.stringify({ error: "Invalid request body." }), { status: 400 });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "").trim();

  if (!name || !email || !password) {
    return new Response(JSON.stringify({ error: "Name, email and password are required." }), { status: 400 });
  }

  if (name.length < 3) {
    return new Response(JSON.stringify({ error: "Name must be at least 3 characters." }), { status: 400 });
  }

  if (!emailPattern.test(email)) {
    return new Response(JSON.stringify({ error: "Enter a valid email address." }), { status: 400 });
  }

  if (password.length < 8) {
    return new Response(JSON.stringify({ error: "Password must be at least 8 characters." }), { status: 400 });
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return new Response(JSON.stringify({ error: "An account with this email already exists." }), { status: 409 });
  }

  await createUser({ name, email, password });
  return new Response(JSON.stringify({ success: true }), { status: 201 });
}
