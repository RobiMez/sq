import { json } from "@sveltejs/kit";
import Quest from "$lib/models/quest.schema.js";
import type { IQuestClient, } from "../../../types/quest.js";


export async function POST({ request }) {
  const body = await request.json();
  const { quest, uid } = body as unknown as { quest: IQuestClient; uid: string; };

  console.log('Not cloning quest', quest);

  // Fetch the quest from the database
  // const existingQuest = await Quest.findById(quest._id).exec();

  // // Check if the user's uid is already in the cloners list
  // const isCloner = existingQuest.cloners.includes(uid);

  // // Check if the user already has a clone of the quest
  // const hasClone = await Quest.exists({ uid: uid, originalQuestId: quest._id });


  // if (!isCloner && !hasClone) {
  //   // If the user is not in the cloners list and doesn't have a clone,
  //   // add the user to the cloners list and create a clone of the quest

  //   // Add the user to the cloners list
  //   await Quest.findByIdAndUpdate(quest._id, {
  //     $push: { cloners: uid },
  //   }, { new: true });

  //   // Create a clone of the quest
  //   const { _id: originalQuestId, ...newQuest } = quest;
  //   console.log('cloned quest', originalQuestId);
  //   const createdQuest = await Quest.create({
  //     ...newQuest,
  //     uid,
  //     originalQuestId,
  //   });

  //   return json({ status: 200, body: createdQuest });
  // }

  // If the user is already in the cloners list or already has a clone, do nothing
  return json({ status: 200, body: {}  });
}