-- Create function that fires pg_notify on response insert
CREATE OR REPLACE FUNCTION notify_new_response()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'new_response',
    json_build_object(
      'formId', NEW."formId",
      'responseId', NEW.id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on Response table
DROP TRIGGER IF EXISTS response_notify_trigger ON "Response";
CREATE TRIGGER response_notify_trigger
  AFTER INSERT ON "Response"
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_response();
