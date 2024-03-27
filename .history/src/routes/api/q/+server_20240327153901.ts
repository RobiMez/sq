import { json } from "@sveltejs/kit";
import { ChatOpenAI } from "@langchain/openai";

const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function POST({ request }) {
  const body = await request.json();
  const { description } = body as unknown as { description: string; };

  console.log(await chatModel.invoke("what is LangSmith?"););
  // process the request

  const reply = description;

  return json({ status: 200, body: reply });
}

