import { json } from "@sveltejs/kit";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

const prompt = PromptTemplate.fromTemplate(`Make a short title for {subject}`);
const functionSchema = [
  {
    name: "order",
    description: "An ordered structure out of the subject",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title for the subject",
        },
        tags: {
          type: "string",
          description: "A series of tags that closely relate to the subject",
        },
        steps: {
          type: "string",
          description: "A series of Steps that lead to the user achiving the goal of the subject",
        },
      },
      required: ["title", "tags","steps"],
    },
  },
];
const model = new ChatOpenAI({
  openAIApiKey: process.env['OPENAI_API_KEY'],
});
const chain = prompt.pipe(
  model.bind({
    functions: functionSchema,
    function_call: { name: "order" },
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

