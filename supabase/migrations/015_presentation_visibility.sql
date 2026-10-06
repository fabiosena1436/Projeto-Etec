-- Controle global dos cinco exemplos do frontend, sem alterar cadastros reais.
BEGIN;
CREATE TABLE IF NOT EXISTS public.presentation_settings (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 enabled boolean NOT NULL DEFAULT true,
 updated_by uuid REFERENCES public.profiles(id),
 updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.presentation_settings(singleton) VALUES(true) ON CONFLICT DO NOTHING;
ALTER TABLE public.presentation_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.presentation_settings FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.presentation_demo_visibility()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce((SELECT enabled FROM presentation_settings WHERE singleton),false)
$$;
CREATE OR REPLACE FUNCTION public.admin_set_presentation_demos(show_examples boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Acesso exclusivo do superadministrador'; END IF;
 IF show_examples IS NULL THEN RAISE EXCEPTION 'Informe se os exemplos devem aparecer'; END IF;
 UPDATE presentation_settings SET enabled=show_examples,updated_by=auth.uid(),updated_at=now() WHERE singleton;
 INSERT INTO audit_logs(actor_id,action,entity_type,metadata)
 VALUES(auth.uid(),'admin_presentation_visibility','presentation',jsonb_build_object('enabled',show_examples));
END $$;
REVOKE ALL ON FUNCTION public.presentation_demo_visibility(),public.admin_set_presentation_demos(boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.presentation_demo_visibility() TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_presentation_demos(boolean) TO authenticated;
COMMIT;
