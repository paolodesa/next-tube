import { spawn, spawnSync } from "child_process";
import { rm } from "fs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Job } from "bullmq";

const extractThumbs = async (
  filename: string,
  videoId: string,
  userId: string,
  duration: number,
  supabaseUrl: string,
  supabaseKey: string
) => {
  console.log("Generating thumbnails...");
  const timeShift = Math.floor(duration / 3);

  for (let i = 1; i < 4; i++) {
    const args = [
      "-y",
      "-hide_banner",
      "-loglevel",
      "warning",
      "-ss",
      `${timeShift * (i - 1)}`,
      "-i",
      `/transcode/${filename}`,
      "-vf",
      "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,select=gt(scene\\,0.25)",
      "-update",
      "1",
      "-frames:v",
      "1",
      "-method",
      "POST",
      "-protocol_opts",
      `headers=authorization\\: Bearer ${supabaseKey}\r\nContent-Type\\: image/jpeg\r\nx-upsert\\: true\r\n`,
      `${supabaseUrl}/storage/v1/object/videos/${userId}/${videoId}/thumb-${i}.jpeg`,
    ];
    const ffmpegProc = spawnSync("ffmpeg", args);

    if (ffmpegProc.stderr.toString().match("Output file is empty")) {
      const args2 = [
        "-y",
        "-hide_banner",
        "-loglevel",
        "warning",
        "-ss",
        `${timeShift * (i - 1)}`,
        "-i",
        `/transcode/${filename}`,
        "-vf",
        "thumbnail",
        "-update",
        "1",
        "-frames:v",
        "1",
        "-method",
        "POST",
        "-protocol_opts",
        `headers=authorization\\: Bearer ${supabaseKey}\r\nContent-Type\\: image/jpeg\r\nx-upsert\\: true\r\n`,
        `${supabaseUrl}/storage/v1/object/videos/${userId}/${videoId}/thumb-${i}.jpeg`,
      ];
      spawnSync("ffmpeg", args2);
    }
  }

  console.log("Thumbnails uploaded successfully");
};

const transcodeVideo = async (
  filename: string,
  userId: string,
  videoId: string,
  supabase: SupabaseClient,
  job: Job,
  supabaseUrl: string,
  supabaseKey: string,
  codec_name: string,
  ogWidth: number,
  n_frames: number,
  duration: number
) => {
  var input_codec: string;

  switch (codec_name) {
    case "h264":
      input_codec = "h264_qsv";
      break;
    case "hevc":
      input_codec = "hevc_qsv";
      break;
    case "vp9":
      input_codec = "vp9_qsv";
      break;
    default:
      rm(
        `/transcode/${userId}/${videoId}`,
        {
          recursive: true,
          force: true,
        },
        () => {}
      );
      throw new Error("Unsupported input video codec");
  }

  var variable_args: string[];

  const fps = n_frames / duration;
  const gop_length = 2;
  const hls_segment_length = 6;

  const common_settings = [
    "-preset",
    "faster",
    "-look_ahead",
    "1",
    "-profile",
    "main",
    "-g",
    `${Math.round(gop_length * fps)}`,
    "-flags",
    "+cgop",
  ];
  const settings_4k = ["12M", ...common_settings];
  const settings_1080 = ["6M", ...common_settings];
  const settings_720 = ["3M", ...common_settings];
  const settings_360 = ["1M", ...common_settings];
  const output_settings = [
    "-f",
    "hls",
    "-hls_time",
    `${hls_segment_length}`,
    "-hls_playlist_type",
    "vod",
    "-hls_flags",
    "independent_segments",
    "-hls_segment_type",
    "fmp4",
    "-master_pl_name",
    "master.m3u8",
    "-method",
    "POST",
    "-headers",
    `authorization: Bearer ${supabaseKey}\r\nx-upsert: true\r\n`,
    "-hls_segment_filename",
    `${supabaseUrl}/storage/v1/object/videos/${userId}/${videoId}/stream_%v/data%02d.m4s`,
    `${supabaseUrl}/storage/v1/object/videos/${userId}/${videoId}/stream_%v/main.m3u8`,
  ];

  switch (ogWidth) {
    case 3840:
      variable_args = [
        "-filter_complex",
        "[0:v]split=4[v1][v2][v3][v4]; [v1]scale_qsv=3840:-1[v1out];[v2]scale_qsv=1920:-1[v2out];[v3]scale_qsv=1280:-1[v3out];[v4]scale_qsv=640:-1[v4out]; [0:a]asplit=4[a1][a2][a3][a4]",
        "-map",
        "[v1out]",
        "-c:v:0",
        "hevc_qsv",
        "-b:v:0",
        ...settings_4k,
        "-map",
        "[v2out]",
        "-c:v:1",
        "hevc_qsv",
        "-b:v:1",
        ...settings_1080,
        "-map",
        "[v3out]",
        "-c:v:2",
        "hevc_qsv",
        "-b:v:2",
        ...settings_720,
        "-map",
        "[v4out]",
        "-c:v:3",
        "hevc_qsv",
        "-b:v:3",
        ...settings_360,
        "-map",
        "[a1]",
        "-c:a:0",
        "aac",
        "-b:a:0",
        "256k",
        "-map",
        "[a2]",
        "-c:a:1",
        "aac",
        "-b:a:1",
        "256k",
        "-map",
        "[a3]",
        "-c:a:2",
        "aac",
        "-b:a:2",
        "128k",
        "-map",
        "[a4]",
        "-c:a:3",
        "aac",
        "-b:a:3",
        "128k",
        "-var_stream_map",
        "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3",
        ...output_settings,
      ];
      break;
    case 1920:
      variable_args = [
        "-filter_complex",
        "[0:v]split=3[v1][v2][v3]; [v1]scale_qsv=1920:-1[v1out];[v2]scale_qsv=1280:-1[v2out];[v3]scale_qsv=640:-1[v3out]; [0:a]asplit=3[a1][a2][a3]",
        "-map",
        "[v1out]",
        "-c:v:0",
        "hevc_qsv",
        "-b:v:0",
        ...settings_1080,
        "-map",
        "[v2out]",
        "-c:v:1",
        "hevc_qsv",
        "-b:v:1",
        ...settings_720,
        "-map",
        "[v3out]",
        "-c:v:2",
        "hevc_qsv",
        "-b:v:2",
        ...settings_360,
        "-map",
        "[a1]",
        "-c:a:0",
        "aac",
        "-b:a:0",
        "256k",
        "-map",
        "[a2]",
        "-c:a:1",
        "aac",
        "-b:a:1",
        "128k",
        "-map",
        "[a3]",
        "-c:a:2",
        "aac",
        "-b:a:2",
        "128k",
        "-var_stream_map",
        "v:0,a:0 v:1,a:1 v:2,a:2",
        ...output_settings,
      ];
      break;
    default:
      variable_args = [
        "-filter_complex",
        "[0:v]split=2[v1][v2]; [v1]scale_qsv=1280:-1[v1out];[v2]scale_qsv=640:-1[v2out]; [0:a]asplit=2[a1][a2]",
        "-map",
        "[v1out]",
        "-c:v:0",
        "hevc_qsv",
        "-b:v:0",
        ...settings_720,
        "-map",
        "[v2out]",
        "-c:v:1",
        "hevc_qsv",
        "-b:v:1",
        ...settings_360,
        "-map",
        "[a1]",
        "-c:a:0",
        "aac",
        "-b:a:0",
        "128k",
        "-map",
        "[a2]",
        "-c:a:1",
        "aac",
        "-b:a:1",
        "128k",
        "-var_stream_map",
        "v:0,a:0 v:1,a:1",
        ...output_settings,
      ];
  }

  const ffmpeg_args = [
    "-hwaccel",
    "qsv",
    "-c:v",
    `${input_codec}`,
    "-i",
    `/transcode/${filename}`,
    ...variable_args,
  ];

  const ffmpegProc = spawn("ffmpeg", ffmpeg_args);
  console.log("Transcoding video...");

  var last_message_ts = 0;

  ffmpegProc.stderr.on("data", async (data) => {
    if (Date.now() - last_message_ts >= 2500) {
      last_message_ts = Date.now();
      const match_prog = data.toString().match(RegExp("(?<=frame=)\\s*\\d+"));
      const match_speed = data
        .toString()
        .match(RegExp("(?<=speed=)\\d+(.\\d+)?"));
      if (match_prog && match_speed) {
        const processedFrames = parseInt(match_prog[0].trim());
        const speed = parseFloat(match_speed[0].trim());
        const progress = Math.round((processedFrames / n_frames) * 100);
        console.log(`Progress: ${progress}% - Speed: ${speed}x`);
        await job.updateProgress(progress);
        await supabase
          .from("Video")
          .update({ processingProgress: progress })
          .eq("id", videoId);
      }
    }
  });

  ffmpegProc.on("error", (error) => {
    console.log(`ffmpeg error: ${error.message}`);
  });

  const exitCode = await new Promise((resolve) => {
    ffmpegProc.on("close", resolve);
  });

  rm(
    `/transcode/${userId}/${videoId}`,
    {
      recursive: true,
      force: true,
    },
    () => {}
  );

  if (exitCode !== 0) {
    throw new Error(`ffmpeg process exited with code ${exitCode}`);
  } else {
    console.log("Video transcoding done");
  }
};

export const processVideo = async (
  url: string,
  filename: string,
  videoId: string,
  userId: string,
  supabase: SupabaseClient,
  job: Job,
  supabaseUrl: string,
  supabaseKey: string
) => {
  console.log("Downloading raw video...");
  spawnSync("curl", [
    `${url}`,
    "-o",
    `/transcode/${filename}`,
    "--create-dirs",
  ]);
  console.log("Raw video download done");

  const ffprobeProc = spawnSync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-count_packets",
    "-show_entries",
    "stream=codec_name,width,nb_read_packets:format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    `/transcode/${filename}`,
  ]);
  const ffProbeOutput = ffprobeProc.stdout.toString().split("\n");
  const codec_name = ffProbeOutput[0].trim();
  const ogWidth = parseInt(ffProbeOutput[1].trim());
  const n_frames = parseInt(ffProbeOutput[2].trim());
  const duration = parseFloat(ffProbeOutput[3].trim());

  await extractThumbs(filename, videoId, userId, duration, supabaseUrl, supabaseKey);
  await supabase
    .from("Video")
    .update({ thumbnailsReady: true })
    .eq("id", videoId);
  await transcodeVideo(
    filename,
    userId,
    videoId,
    supabase,
    job,
    supabaseUrl,
    supabaseKey,
    codec_name,
    ogWidth,
    n_frames,
    duration
  );

  console.log("Publishing video...");

  await supabase
    .from("Video")
    .update({ duration: Math.round(duration), status: "PUBLIC" })
    .eq("id", videoId);

  await supabase.storage.from("raw-videos").remove([filename]);

  console.log("Video processing done");
};
