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
        time: {
          type: "string",
          description: "A rough estimate of time it would take to achive the goal of the subject",
        },
        steps: {
          type: "array",
          description: "A series of Steps that lead to the user achiving the goal of the subject",
        },
      },
      required: ["title", "tags", "steps", "time"],
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

  const result = await chain.invoke({ subject: description });

  console.log(result.additional_kwargs.function_call?.arguments);
  // serialize as JSON and return
  const reply = JSON.parse(result.additional_kwargs.function_call?.arguments ?? '{}');



  return json({ status: 200, body: reply });
}

