import { Worker } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { processVideo } from "./ffmpeg.js";

if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_KEY ||
  !process.env.REDIS_HOST ||
  !process.env.REDIS_PORT ||
  !process.env.REDIS_PASSWORD
) {
  throw new Error("Please define the necessary environment varibles.");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const worker = new Worker(
  "transcoding",
  async (job) => {
    const filename = job.data.filename;
    const userId = job.data.userId;
    const videoId = job.name;

    const { data, error } = await supabase.storage
      .from("raw-videos")
      .createSignedUrl(filename, 3600);

    if (error) {
      console.log(error);
      throw new Error(error.message);
    }

    await processVideo(data!.signedUrl, filename, videoId, userId, supabase, job, process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    },
    removeOnComplete: {
      age: 3600,
    },
    lockDuration: 60000 * 5
  }
);

worker.on("completed", async (job) => {
  await job.updateProgress(100);
  console.log(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`${job!.id} has failed with ${err.message}`);
});
