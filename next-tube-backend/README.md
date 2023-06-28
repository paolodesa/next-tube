This folder contains the source code for the Docker container which handles transcoding jobs coming from the website. For that purpose FFMPEG is used and it's configured to use Intel QSV acceleration out of the box. The job queue is handled through BullMQ, which uses Redis to store the pending and ongoing jobs. Once the transcoding is complete, the segments are stored on a Supabase instance.

Therefore, the container has to be configured with the corresponign environment variables, which are:
- SUPABASE_URL
- SUPABASE_KEY
- REDIS_HOST
- REDIS_PORT
- REDIS_PASSWORD