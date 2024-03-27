import { json } from "@sveltejs/kit";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

const prompt = PromptTemplate.fromTemplate(`Make a short title for {subject}`);
const functionSchema = [
  {
    name: "title",
    description: "A title for the subject",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title for the subject",
        },
      },
      required: ["title"],
    },
  },
];
const model = new ChatOpenAI({
  openAIApiKey: process.env['OPENAI_API_KEY'],
});
const chain = prompt.pipe(
  model.bind({
    functions: functionSchema,
    function_call: { name: "title" },
  })
);

export async function POST({ request }) {
  const body = await request.json();
  const { description } = body as unknown as { description: string; };

  const result = await chain.invoke({ subject: description  });

  console.log(result);

  // process the request

  const reply = description;

  return json({ status: 200, body: reply });
}

