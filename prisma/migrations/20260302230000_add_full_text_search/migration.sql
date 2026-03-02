-- Add full-text search to File table using PostgreSQL tsvector
-- This enables fast search across file paths and content

-- Add the tsvector column
ALTER TABLE "File" ADD COLUMN "searchVector" tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX "File_searchVector_idx" ON "File" USING GIN ("searchVector");

-- Create function to generate search vector from path and content
-- Weight A for path (most important), Weight B for content
CREATE OR REPLACE FUNCTION file_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := 
    setweight(to_tsvector('english', COALESCE(NEW.path, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector on INSERT or UPDATE
CREATE TRIGGER file_search_vector_trigger
  BEFORE INSERT OR UPDATE OF path, content
  ON "File"
  FOR EACH ROW
  EXECUTE FUNCTION file_search_vector_update();

-- Backfill existing records
UPDATE "File" SET "searchVector" = 
  setweight(to_tsvector('english', COALESCE(path, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(content, '')), 'B');
