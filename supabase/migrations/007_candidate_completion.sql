-- Keep profile, skill and experience edits working on existing and new databases.
BEGIN;
CREATE OR REPLACE FUNCTION public.calculate_candidate_completion(candidate_uuid uuid)
RETURNS integer LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT round(100.0 * (
    (coalesce(length(c.about), 0) > 20)::int +
    (nullif(trim(c.profession), '') IS NOT NULL)::int +
    (nullif(trim(c.education), '') IS NOT NULL)::int +
    (nullif(c.resume_url, '') IS NOT NULL)::int +
    (nullif(trim(c.city), '') IS NOT NULL)::int +
    EXISTS(SELECT 1 FROM public.candidate_skills s WHERE s.candidate_id = c.profile_id)::int +
    EXISTS(SELECT 1 FROM public.candidate_experiences e WHERE e.candidate_id = c.profile_id)::int
  ) / 7)::integer FROM public.candidates c WHERE c.profile_id = candidate_uuid;
$$;

CREATE OR REPLACE FUNCTION public.update_candidate_completion()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE candidate_uuid uuid;
BEGIN
  -- Records from candidates have profile_id; skill/experience records have candidate_id.
  -- Access each field only on its own table, including OLD during deletion.
  IF TG_TABLE_NAME = 'candidates' THEN
    candidate_uuid := NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    candidate_uuid := OLD.candidate_id;
  ELSE
    candidate_uuid := NEW.candidate_id;
  END IF;
  UPDATE public.candidates
    SET completion_percent = public.calculate_candidate_completion(candidate_uuid)
    WHERE profile_id = candidate_uuid;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_candidate_completion_on_candidate ON public.candidates;
CREATE TRIGGER trg_candidate_completion_on_candidate
  AFTER INSERT OR UPDATE OF about, profession, education, resume_url, city ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_candidate_completion();
DROP TRIGGER IF EXISTS trg_candidate_completion_on_skills ON public.candidate_skills;
CREATE TRIGGER trg_candidate_completion_on_skills AFTER INSERT OR DELETE ON public.candidate_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_candidate_completion();
DROP TRIGGER IF EXISTS trg_candidate_completion_on_exp ON public.candidate_experiences;
CREATE TRIGGER trg_candidate_completion_on_exp AFTER INSERT OR UPDATE OR DELETE ON public.candidate_experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_candidate_completion();
REVOKE ALL ON FUNCTION public.calculate_candidate_completion(uuid), public.update_candidate_completion() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_candidate_completion(uuid) TO authenticated;
COMMIT;
