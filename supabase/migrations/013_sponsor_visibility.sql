-- Shared commercial spaces with private, bounded delivery records.
CREATE TABLE IF NOT EXISTS public.sponsor_deliveries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
 promotion_id uuid REFERENCES public.promotions(id) ON DELETE SET NULL,
 surface text NOT NULL CHECK(surface IN ('home','community')),
 session_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 impression_at timestamptz, click_at timestamptz, visit_at timestamptz, whatsapp_at timestamptz
);
CREATE INDEX IF NOT EXISTS sponsor_deliveries_session ON public.sponsor_deliveries(session_id,surface,created_at);
CREATE INDEX IF NOT EXISTS sponsor_deliveries_company ON public.sponsor_deliveries(company_id,created_at);
CREATE INDEX IF NOT EXISTS sponsor_deliveries_created ON public.sponsor_deliveries(created_at);
ALTER TABLE public.sponsor_deliveries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sponsor_deliveries FROM anon,authenticated;

CREATE OR REPLACE FUNCTION public.sponsor_placements(placement text, visitor_session uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE slots integer; chosen record; result jsonb; remaining integer;
BEGIN
 IF placement IS NULL OR placement NOT IN ('home','community') OR visitor_session IS NULL THEN RAISE EXCEPTION 'Espaço inválido'; END IF;
 slots:=CASE WHEN placement='home' THEN 3 ELSE 1 END;
 -- Concurrent requests cannot assign all slots to the same company.
 PERFORM pg_advisory_xact_lock(713013);
 DELETE FROM sponsor_deliveries WHERE created_at<now()-interval '45 days';
 -- A global allocation budget prevents public sessions from growing storage without bound.
 remaining:=greatest(0,10000-(SELECT count(*)::integer FROM sponsor_deliveries WHERE created_at>=date_trunc('day',now())));
 IF (SELECT count(*) FROM sponsor_deliveries WHERE session_id=visitor_session AND created_at>now()-interval '1 hour')>=20 THEN
   RETURN '[]'::jsonb;
 END IF;
 FOR chosen IN
   SELECT c.id FROM companies c JOIN profiles owner ON owner.id=c.owner_profile_id
   WHERE owner.is_active AND public.is_current_sponsor(c.id)
   AND NOT EXISTS(SELECT 1 FROM sponsor_deliveries d WHERE d.company_id=c.id AND d.surface=placement
     AND d.session_id=visitor_session AND d.created_at>=date_trunc('day',now()))
   ORDER BY (SELECT count(*) FROM sponsor_deliveries d WHERE d.company_id=c.id AND d.surface=placement
     AND d.impression_at>now()-interval '30 days'),
     (SELECT count(*) FROM sponsor_deliveries d WHERE d.company_id=c.id AND d.surface=placement
     AND d.created_at>now()-interval '30 days'), c.id
   LIMIT least(remaining,greatest(0,slots-(SELECT count(*)::integer FROM sponsor_deliveries d JOIN companies c ON c.id=d.company_id
     JOIN profiles owner ON owner.id=c.owner_profile_id WHERE d.session_id=visitor_session AND d.surface=placement
     AND d.created_at>=date_trunc('day',now()) AND public.is_current_sponsor(c.id) AND owner.is_active)))
 LOOP
   INSERT INTO sponsor_deliveries(company_id,promotion_id,surface,session_id)
   VALUES(chosen.id,(SELECT p.id FROM promotions p WHERE p.company_id=chosen.id AND p.is_active
     AND (p.valid_until IS NULL OR p.valid_until >= (now() AT TIME ZONE 'America/Sao_Paulo')::date)
     ORDER BY (SELECT count(*) FROM sponsor_deliveries d WHERE d.promotion_id=p.id
       AND d.created_at>now()-interval '30 days'),p.created_at DESC,p.id LIMIT 1),placement,visitor_session);
 END LOOP;
 SELECT coalesce(jsonb_agg(item ORDER BY created_at,id),'[]'::jsonb) INTO result FROM (
   SELECT d.created_at,d.id,jsonb_build_object('token',d.id,'company_id',c.id,'company_name',c.name,
     'logo_url',c.logo_url,'industry',c.industry,'title',coalesce(p.title,c.slogan,c.name),
     'description',coalesce(p.description,c.description,''),'image_url',p.image_url,'promotion_id',p.id,
     'price',p.price,'discount_price',p.discount_price,'valid_until',p.valid_until) AS item
   FROM sponsor_deliveries d JOIN companies c ON c.id=d.company_id JOIN profiles owner ON owner.id=c.owner_profile_id
   LEFT JOIN promotions p ON p.id=d.promotion_id AND p.is_active
     AND (p.valid_until IS NULL OR p.valid_until >= (now() AT TIME ZONE 'America/Sao_Paulo')::date)
   WHERE d.session_id=visitor_session AND d.surface=placement AND d.created_at>=date_trunc('day',now())
     AND public.is_current_sponsor(c.id) AND owner.is_active
   ORDER BY d.created_at,d.id LIMIT slots
 ) q;
 RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.track_sponsor_event(delivery_token uuid, event_name text, company_uuid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE delivery sponsor_deliveries; owner_id uuid;
BEGIN
 IF event_name NOT IN ('impression','click','visit','whatsapp') OR event_name IS NULL THEN RAISE EXCEPTION 'Evento inválido'; END IF;
 SELECT d.* INTO delivery FROM sponsor_deliveries d JOIN companies c ON c.id=d.company_id
 JOIN profiles p ON p.id=c.owner_profile_id WHERE d.id=delivery_token AND d.company_id=company_uuid AND d.created_at>now()-interval '7 days'
 AND p.is_active AND public.is_current_sponsor(c.id);
 IF NOT FOUND THEN RETURN; END IF;
 SELECT owner_profile_id INTO owner_id FROM companies WHERE id=delivery.company_id;
 -- Test visits by the company owner or administrator are not commercial results.
 IF auth.uid()=owner_id OR public.is_super_admin() THEN RETURN; END IF;
 UPDATE sponsor_deliveries SET
 impression_at=CASE WHEN event_name='impression' THEN coalesce(impression_at,now()) ELSE impression_at END,
 click_at=CASE WHEN event_name='click' THEN coalesce(click_at,now()) ELSE click_at END,
 visit_at=CASE WHEN event_name='visit' THEN coalesce(visit_at,now()) ELSE visit_at END,
 whatsapp_at=CASE WHEN event_name='whatsapp' THEN coalesce(whatsapp_at,now()) ELSE whatsapp_at END
 WHERE id=delivery_token;
END $$;

CREATE OR REPLACE FUNCTION public.sponsor_report(company_uuid uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.can_manage_company(company_uuid) AND NOT public.is_super_admin() THEN RAISE EXCEPTION 'Acesso restrito'; END IF;
 RETURN (SELECT jsonb_build_object('days',30,'impressions',coalesce(sum(impressions),0),
   'clicks',coalesce(sum(clicks),0),'visits',coalesce(sum(visits),0),'whatsapp',coalesce(sum(whatsapp),0),
   'surfaces',coalesce(jsonb_agg(to_jsonb(q)),'[]'::jsonb)) FROM (
   SELECT surface,
   count(*) FILTER(WHERE impression_at>now()-interval '30 days') AS impressions,
   count(*) FILTER(WHERE click_at>now()-interval '30 days') AS clicks,
   count(*) FILTER(WHERE visit_at>now()-interval '30 days') AS visits,
   count(*) FILTER(WHERE whatsapp_at>now()-interval '30 days') AS whatsapp
   FROM sponsor_deliveries WHERE company_id=company_uuid AND created_at>now()-interval '37 days'
   GROUP BY surface ORDER BY surface
 ) q);
END $$;
REVOKE ALL ON FUNCTION public.sponsor_placements(text,uuid),public.track_sponsor_event(uuid,text,uuid),public.sponsor_report(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sponsor_placements(text,uuid),public.track_sponsor_event(uuid,text,uuid) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sponsor_report(uuid) TO authenticated;
