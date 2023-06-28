import type { NextApiRequest, NextApiResponse } from "next";

import { Queue } from "bullmq";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type RecordInsert = {
  bucket_id?: string | null;
  created_at?: string | null;
  id?: string;
  last_accessed_at?: string | null;
  metadata?: Json | null;
  name?: string | null;
  owner?: string | null;
  path_tokens?: string[] | null;
  updated_at?: string | null;
  version?: string | null;
};

type InsertPayload = {
  type: "INSERT";
  table: string;
  schema: string;
  record: RecordInsert;
  old_record: null;
};

// Create a new connection in every instance
const transcodingQueue = new Queue("transcoding", {
  connection: {
    host: process.env.REDIS_HOST,
    port: 6379,
    password: process.env.REDIS_PASS,
  },
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const payload = req.body as InsertPayload;
  const record = payload.record;
  if (
    record.bucket_id === "raw-videos" &&
    record.path_tokens &&
    !record.path_tokens.includes(".emptyFolderPlaceholder")
  ) {
    const userId = record.path_tokens[0] as string;
    const videoId = record.path_tokens[1] as string;
    const filename = record.name;
    try {
      await transcodingQueue.add(videoId, {
        filename: filename,
        userId: userId,
      });
      return res.status(200).send("Job added successfully");
    } catch (error) {
      return res
        .status(500)
        .send("There was an error in adding the job to the queue");
    }
  }
  return res.status(200).send("");
};

export default handler;
