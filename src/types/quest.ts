import type { Document } from 'mongoose';

enum StepState {
  NotStarted = 'NotStarted',
  Completed = 'Completed',
  Skipped = 'Skipped',
}

enum QuestState {
  NotStarted = 'NotStarted',
  Archived = 'Archived',
  InProgress = 'InProgress',
  Completed = 'Completed',
}

interface IStep {
  description: string;
  state: StepState;
}

interface IQuest extends Document {
  uid: string;
  title: string;
  tags: string[];
  time: string;
  steps: IStep[];
  progress: number;
  public: boolean;
  cloners: string[];
  state: QuestState;
}

interface IQuestClient {
  _id: string;
  uid: string;
  title: string;
  tags: string[];
  time: string;
  steps: IStep[];
  progress: number;
  public: boolean;
  cloners: string[];
  state: QuestState;
}

export type { IQuest, IStep, IQuestClient };
export { StepState, QuestState };