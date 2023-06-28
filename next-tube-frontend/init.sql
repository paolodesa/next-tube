-- inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  channel_name text;
  channel_handle text;
begin
  SELECT new.raw_user_meta_data ->> 'name' into channel_name;
  SELECT new.raw_user_meta_data ->> 'handle' into channel_handle;
  insert into public."Channel" (id, name, handle, "updatedAt")
  values (new.id, channel_name, channel_handle, now());
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- update video status once it is uploaded
CREATE OR REPLACE FUNCTION update_video_status()
RETURNS TRIGGER AS $$
DECLARE
  video_id text;
BEGIN
  IF NEW.bucket_id = 'raw-videos' THEN
    video_id := NEW.path_tokens[2];
    UPDATE public."Video" SET
      status = 'PROCESSING'
    WHERE id = video_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger the funciton every time a video is uploaded
CREATE TRIGGER raw_video_insert_trigger
AFTER INSERT ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION update_video_status();