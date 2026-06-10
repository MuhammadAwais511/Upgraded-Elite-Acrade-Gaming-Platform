import crypto from "crypto";
import { createUserInAirtable } from "../../../../lib/airtable";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "").trim();

    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email and password required" },
        { status: 400 }
      );
    }

    await createUserInAirtable({
      id: crypto.randomUUID(),
      name,
      email,
      image: "",
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}