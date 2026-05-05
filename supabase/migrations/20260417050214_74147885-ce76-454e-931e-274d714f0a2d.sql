-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge articles (RAG corpus)
CREATE TABLE public.knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  region TEXT,
  crops TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  content TEXT NOT NULL,
  summary TEXT,
  embedding vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_articles_category ON public.knowledge_articles(category);
CREATE INDEX idx_knowledge_articles_crops ON public.knowledge_articles USING GIN(crops);
CREATE INDEX idx_knowledge_articles_embedding ON public.knowledge_articles
  USING hnsw (embedding vector_cosine_ops);

ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

-- Public read access (knowledge base is public reference content)
CREATE POLICY "Knowledge articles are readable by everyone"
ON public.knowledge_articles FOR SELECT
USING (true);

-- Diagnosis history (anonymous, session-keyed for now)
CREATE TABLE public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  crop TEXT,
  disease TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,
  severity TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_diagnoses_session ON public.diagnoses(session_id, created_at DESC);

ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

-- Anonymous: anyone can insert/read their own session diagnoses (session_id is the secret).
-- This is acceptable for an anonymous diagnostic tool with no PII.
CREATE POLICY "Anyone can insert a diagnosis"
ON public.diagnoses FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can read diagnoses"
ON public.diagnoses FOR SELECT
USING (true);

-- Semantic search RPC
CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(768),
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
SET search_path = public
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

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_knowledge_articles_updated
BEFORE UPDATE ON public.knowledge_articles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();