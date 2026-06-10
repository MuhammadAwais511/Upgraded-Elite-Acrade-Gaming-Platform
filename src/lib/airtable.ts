import Airtable from "airtable";

console.log("=== AIRTABLE CONFIG ===");
console.log("API KEY set:", !!process.env.AIRTABLE_API_KEY);
console.log("BASE ID:", process.env.AIRTABLE_BASE_ID);
console.log("TABLE NAME:", process.env.AIRTABLE_TABLE_NAME || "Users (default)");
console.log("======================");

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!);

const TABLE = process.env.AIRTABLE_TABLE_NAME || "Users";

export async function createUserInAirtable(user: {
  id: string;
  name: string;
  email: string;
  image?: string;
}) {
  console.log("🚀 createUserInAirtable called with:", JSON.stringify(user));

  try {
    console.log("📡 Connecting to Airtable...");

    const existing = await base(TABLE)
      .select({
        filterByFormula: `{email}="${user.email}"`,
        maxRecords: 1,
      })
      .firstPage();

    console.log("✅ Query succeeded. Existing records:", existing.length);

    if (existing.length > 0) {
      console.log("👤 User already exists, skipping create.");
      return existing[0];
    }

    console.log("➕ Creating new user record...");

    const created = await base(TABLE).create([
      {
        fields: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image || "",
          createdAt: new Date().toISOString().split("T")[0],
        },
      },
    ]);

    console.log("🎉 User created! Record ID:", created[0].getId());
    return created[0];

  } catch (error: any) {
    console.error("❌ AIRTABLE FAILED");
    console.error("Message:", error?.message);
    console.error("Status:", error?.statusCode);
    console.error("Error code:", error?.error);
    console.error("Full error:", JSON.stringify(error, null, 2));
    throw error;
  }
}