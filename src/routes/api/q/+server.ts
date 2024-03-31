import { json } from "@sveltejs/kit";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

import { zodToJsonSchema } from "zod-to-json-schema";
import Quest from "$lib/models/quest.schema.js";
import { StepState, type IStep, type IQuestClient } from "../../../types/quest.js";

const prompt = PromptTemplate.fromTemplate(`Make a short title for {subject}`);

const zodSchema = z.object({
  title: z.string().describe("The title for the subject, if you cant make one up, use the subject itself as the title"),
  tags: z.array(z.string()).describe("A series of tags that closely relate to the subject, You must have at least one tag, if you cant find any make the single tag as untagged."),
  time: z.string().describe("A rough estimate of time it would take to achive the goal of the subject"),
  steps: z.array(z.string()).describe("A series of Steps that lead to the user achiving the goal of the subject. Dont use numbering or bullet points , just the text is fine."),
});

const model = new ChatOpenAI({
  openAIApiKey: process.env['OPENAI_API_KEY'],
});
const chain = prompt.pipe(
  model.bind({
    functions: [
      {
        name: "order",
        description: "Should always be used to properly format output",
        parameters: zodToJsonSchema(zodSchema),
      },
    ],
    function_call: { name: "order" },
  })
);

export async function POST({ request }) {
  const body = await request.json();
  const { description, uid } = body as unknown as { description: string; uid: string; };
  const result = await chain.invoke({ subject: description });

  // serialize as JSON and return
  const reply = JSON.parse(result.additional_kwargs.function_call?.arguments ?? '{}');

  const steps = reply.steps;
  let formedSteps: IStep[] = [];

  for (let i = 0; i < steps.length; i++) {
    formedSteps.push({ description: steps[i], state: StepState.NotStarted });
  }
  formedSteps = JSON.parse(JSON.stringify(formedSteps));

  const newQuest = await Quest.create({
    uid,
    title: reply.title,
    tags: reply.tags,
    time: reply.time,
    steps: formedSteps,
  });

  return json({ status: 200, body: newQuest });
}

export async function PATCH({ request }) {

  const body = await request.json();

  if (!body) {
    return json({ status: 400, body: { error: 'Invalid request' } });
  }
  const updatedQuestData: Partial<IQuestClient> = body.quest;
  const questId = updatedQuestData._id;

  // If the quest's uid is 'PUBLIC', return an error response
  if (updatedQuestData.public) {
    return json({ status: 403, body: { error: 'Patches not allowed for public set UIDs' } });
  }

  const updatedQuest = await Quest.findByIdAndUpdate(questId, updatedQuestData, { new: true });

  if (!updatedQuest) {
    return json({ status: 404, body: { error: 'Quest not found' } });
  }

  return json({ status: 200, body: updatedQuest });

}


export async function GET({ url }) {
  const uid = url.searchParams.get('uid');
  const mine = url.searchParams.get('mine');

  let quests;

  if (uid) {
    let publicQuests;
    if (mine == "false") {
      publicQuests = await Quest.find({ public: true, uid: { $ne: uid } }).exec();
    }
    const myQuests = await Quest.find({ uid: uid }).exec();

    // Merge myQuests and publicQuests
    const uniqueQuests = [...myQuests ?? [], ...publicQuests ?? []];

    quests = uniqueQuests;
  }
  else {
    // Otherwise, fetch all quests
    quests = await Quest.find({ public: true }).exec();
  }

  return json({ status: 200, body: quests });
}