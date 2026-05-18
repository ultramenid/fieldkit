-- Create function that fires pg_notify on form insert/update/delete
CREATE OR REPLACE FUNCTION notify_form_change()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'form_change',
    json_build_object(
      'userId', COALESCE(NEW."userId", OLD."userId"),
      'formId', COALESCE(NEW.id, OLD.id)
    )::text
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on Form table
DROP TRIGGER IF EXISTS form_change_trigger ON "Form";
CREATE TRIGGER form_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON "Form"
  FOR EACH ROW
  EXECUTE FUNCTION notify_form_change();
