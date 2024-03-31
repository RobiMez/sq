import { json } from "@sveltejs/kit";
import { v4 as uuidv4 } from 'uuid';
import Uuid from "$lib/models/uuid.schema";


export async function POST({ request }) {
  const body = await request.json();
  const userId = uuidv4();

  Uuid.create({
    uid: userId,
    username: body.username
  });

  return json({
    status: 200, body: {
      userId
    }
  });
}

export async function PATCH({ request }) {
  const body = await request.json();
  return json({ status: 200, body: body });
}
