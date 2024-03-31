import { json } from "@sveltejs/kit";

import Quest from "$lib/models/quest.schema.js";
import type { IQuestClient } from "../../../types/quest.js";

export async function PATCH({ request }) {

  const body = await request.json();
  console.log('change public status of quest')

  if (!body) {
    return json({ status: 400, body: { error: 'Invalid request' } });
  }

  const updatedQuestData: Partial<IQuestClient> = body.quest;
  const questId = updatedQuestData._id;

  const updatedQuest = await Quest.findByIdAndUpdate(questId, {
    public: updatedQuestData.public
  }, { new: true });

  if (!updatedQuest) {
    return json({ status: 404, body: { error: 'Quest not found' } });
  }

  return json({ status: 200, body: updatedQuest });

}
