-- A recruiter must not restore access to a candidate who withdrew consent.
CREATE OR REPLACE FUNCTION public.protect_application_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.job_id IS DISTINCT FROM OLD.job_id OR NEW.candidate_id IS DISTINCT FROM OLD.candidate_id OR NEW.company_id IS DISTINCT FROM OLD.company_id
    THEN RAISE EXCEPTION 'Identidade da candidatura não pode ser alterada'; END IF;
  IF auth.uid() = OLD.candidate_id AND NEW.status <> 'desistiu'
    THEN RAISE EXCEPTION 'Candidato só pode desistir da candidatura'; END IF;
  IF auth.uid() IS NOT NULL AND OLD.status = 'desistiu' AND NEW.status <> 'desistiu'
    THEN RAISE EXCEPTION 'Uma candidatura retirada não pode ser reativada'; END IF;
  RETURN NEW;
END $$;
