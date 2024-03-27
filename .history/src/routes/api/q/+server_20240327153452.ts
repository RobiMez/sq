import { json } from "@sveltejs/kit";
import { OpenAI } from "@langchain/openai";

export async function POST({ request }) {
  const body = await request.json();
  const { description } = body as unknown as { description: string; };

  console.log(description);
  // process the request

  const reply = description;

  return json({ status: 200, body: reply });
}

