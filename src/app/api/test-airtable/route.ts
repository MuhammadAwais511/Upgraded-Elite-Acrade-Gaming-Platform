import Airtable from "airtable";

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!);

export async function GET() {
  try {
    const created = await base("Users").create([
      {
        fields: {
          id: "test123",
          name: "Test User",
          email: "test@example.com",
          image: "",
          createdAt: new Date().toISOString(),
        },
      },
    ]);

    return Response.json({ success: true, created });
  } catch (err: any) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}