import mongoose, { Schema } from 'mongoose';
import { StepState, QuestState } from '../../types/quest';

import type { IQuest, } from '../../types/quest';

// Define the QuestState enum


const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const StepSchema: Schema = new Schema({
  description: { type: String, required: true },
  state: {
    type: String,
    enum: Object.values(StepState),
    default: StepState.NotStarted
  },
});

const QuestSchema: Schema = new Schema({
  uid: { type: String, required: true, default: 'PUBLIC' },
  title: { type: String, required: true },
  tags: { type: [String], required: true },
  time: { type: String, required: true },
  steps: { type: [StepSchema], required: true, default: [] },
  progress: { type: Number, default: 0, required: true },
  public: { type: Boolean, default: false },
  cloners: { type: [String], default: [] },
  state: {
    type: String,
    enum: Object.values(QuestState),
    default: QuestState.NotStarted,
    required: true,
  },
}, opts);


export default mongoose.models.Quest || mongoose.model<IQuest>('Quest', QuestSchema);