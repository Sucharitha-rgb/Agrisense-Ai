-- Move vector extension out of public schema
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;

-- Tighten the diagnosis insert policy: require a session_id
DROP POLICY IF EXISTS "Anyone can insert a diagnosis" ON public.diagnoses;
CREATE POLICY "Insert requires session id"
ON public.diagnoses FOR INSERT
WITH CHECK (length(session_id) BETWEEN 8 AND 128);

-- Recreate match function with new schema-qualified type
CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding extensions.vector(768),
  match_count int DEFAULT 5,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  region TEXT,
  crops TEXT[],
  summary TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
SET search_path = public, extensions
AS $$
  SELECT
    ka.id, ka.title, ka.category, ka.region, ka.crops, ka.summary, ka.content,
    1 - (ka.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_articles ka
  WHERE ka.embedding IS NOT NULL
    AND (filter_category IS NULL OR ka.category = filter_category)
  ORDER BY ka.embedding <=> query_embedding
  LIMIT match_count;
$$;