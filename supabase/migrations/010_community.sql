-- Comunidade pública. Tabelas fechadas; leitura e escrita exclusivamente por RPCs.
BEGIN;
CREATE TABLE IF NOT EXISTS public.company_posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES public.profiles(id), body text NOT NULL CHECK(length(btrim(body)) BETWEEN 1 AND 2000),
 image_url text CHECK(image_url IS NULL OR (length(image_url)<=2048 AND image_url ~ '^https://')),
 withdrawn boolean NOT NULL DEFAULT false, hidden boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.post_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES public.company_posts(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES public.profiles(id), body text NOT NULL CHECK(length(btrim(body)) BETWEEN 1 AND 500),
 withdrawn boolean NOT NULL DEFAULT false, hidden boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.post_likes (
 post_id uuid REFERENCES public.company_posts(id) ON DELETE CASCADE, profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
 PRIMARY KEY(post_id,profile_id)
);
CREATE TABLE IF NOT EXISTS public.company_followers (
 company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE, profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
 PRIMARY KEY(company_id,profile_id)
);
CREATE TABLE IF NOT EXISTS public.community_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id uuid NOT NULL REFERENCES public.profiles(id),
 post_id uuid REFERENCES public.company_posts(id) ON DELETE CASCADE, comment_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE,
 reason text NOT NULL CHECK(length(btrim(reason)) BETWEEN 5 AND 500), resolved boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), CHECK(num_nonnulls(post_id,comment_id)=1)
);
CREATE UNIQUE INDEX IF NOT EXISTS community_report_post_unique ON public.community_reports(reporter_id,post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS community_report_comment_unique ON public.community_reports(reporter_id,comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS company_posts_feed ON public.company_posts(created_at DESC,id DESC) WHERE NOT hidden AND NOT withdrawn;
CREATE INDEX IF NOT EXISTS company_posts_company ON public.company_posts(company_id,created_at DESC);
CREATE INDEX IF NOT EXISTS post_comments_parent ON public.post_comments(post_id,created_at DESC);
CREATE INDEX IF NOT EXISTS company_followers_profile ON public.company_followers(profile_id,company_id);
CREATE INDEX IF NOT EXISTS community_reports_pending ON public.community_reports(created_at DESC) WHERE NOT resolved;
ALTER TABLE public.company_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.company_posts,public.post_comments,public.post_likes,public.company_followers,public.community_reports FROM anon,authenticated;

CREATE OR REPLACE FUNCTION public.community_feed(company_uuid uuid DEFAULT NULL, following_only boolean DEFAULT false, before_time timestamptz DEFAULT NULL, before_uuid uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce(jsonb_agg(item ORDER BY created_at DESC,id DESC),'[]'::jsonb) FROM (
 SELECT p.created_at,p.id,jsonb_build_object(
 'id',p.id,'company_id',c.id,'company_name',c.name,'logo_url',c.logo_url,'verified',c.is_verified,'sponsor',public.is_current_sponsor(c.id),
 'body',p.body,'image_url',p.image_url,'created_at',p.created_at,'updated_at',p.updated_at,
 'can_edit',public.can_manage_company(c.id),'likes',(SELECT count(*) FROM post_likes l WHERE l.post_id=p.id),
 'liked',EXISTS(SELECT 1 FROM post_likes l WHERE l.post_id=p.id AND l.profile_id=auth.uid()),
 'following',EXISTS(SELECT 1 FROM company_followers f WHERE f.company_id=c.id AND f.profile_id=auth.uid()),
 'comment_count',(SELECT count(*) FROM post_comments m JOIN profiles a ON a.id=m.author_id WHERE m.post_id=p.id AND NOT m.hidden AND NOT m.withdrawn AND a.is_active),
 'comments',coalesce((SELECT jsonb_agg(x.item ORDER BY x.created_at,x.id) FROM (
 SELECT m.created_at,m.id,jsonb_build_object('id',m.id,'body',m.body,'name',a.full_name,'created_at',m.created_at,'own',m.author_id=auth.uid()) item
 FROM post_comments m JOIN profiles a ON a.id=m.author_id WHERE m.post_id=p.id AND NOT m.hidden AND NOT m.withdrawn AND a.is_active
 ORDER BY m.created_at DESC,m.id DESC LIMIT 20) x),'[]'::jsonb)) item
 FROM company_posts p JOIN companies c ON c.id=p.company_id JOIN profiles owner ON owner.id=c.owner_profile_id JOIN profiles author ON author.id=p.author_id
 WHERE NOT p.hidden AND NOT p.withdrawn AND owner.is_active AND author.is_active
 AND (company_uuid IS NULL OR c.id=company_uuid)
 AND (NOT following_only OR EXISTS(SELECT 1 FROM company_followers f WHERE f.company_id=c.id AND f.profile_id=auth.uid()))
 AND (before_time IS NULL OR (p.created_at,p.id)<(before_time,coalesce(before_uuid,'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid)))
 ORDER BY p.created_at DESC,p.id DESC LIMIT 20) feed
$$;

CREATE OR REPLACE FUNCTION public.community_company(company_uuid uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT jsonb_build_object('followers',(SELECT count(*) FROM company_followers WHERE company_id=c.id),
 'following',EXISTS(SELECT 1 FROM company_followers WHERE company_id=c.id AND profile_id=auth.uid()))
 FROM companies c JOIN profiles p ON p.id=c.owner_profile_id WHERE c.id=company_uuid AND p.is_active
$$;

CREATE OR REPLACE FUNCTION public.community_action(action_name text, target_uuid uuid, content text DEFAULT NULL, picture text DEFAULT NULL, desired boolean DEFAULT true)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE actor uuid:=auth.uid(); p company_posts; m post_comments; result uuid; company_name text; owner_id uuid;
BEGIN
 IF actor IS NULL OR NOT EXISTS(SELECT 1 FROM profiles WHERE id=actor AND is_active) THEN RAISE EXCEPTION 'Entre em uma conta ativa para participar.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(actor::text,0));
 IF desired IS NULL THEN RAISE EXCEPTION 'Informe o estado desejado.'; END IF;
 IF action_name IN ('follow','publish') THEN
  SELECT c.name,c.owner_profile_id INTO company_name,owner_id FROM companies c JOIN profiles a ON a.id=c.owner_profile_id WHERE c.id=target_uuid AND a.is_active;
  IF owner_id IS NULL THEN RAISE EXCEPTION 'Empresa indisponível.'; END IF;
  IF action_name='follow' THEN
   IF desired THEN INSERT INTO company_followers VALUES(target_uuid,actor) ON CONFLICT DO NOTHING;
   ELSE DELETE FROM company_followers WHERE company_id=target_uuid AND profile_id=actor; END IF;
   RETURN target_uuid;
  END IF;
  IF NOT can_manage_company(target_uuid) THEN RAISE EXCEPTION 'Publicação restrita à sua empresa.'; END IF;
  IF (SELECT count(*) FROM company_posts WHERE author_id=actor AND created_at>now()-interval '1 hour')>=10 THEN RAISE EXCEPTION 'Limite de dez publicações por hora. Tente mais tarde.'; END IF;
  INSERT INTO company_posts(company_id,author_id,body,image_url) VALUES(target_uuid,actor,btrim(content),nullif(btrim(picture),'')) RETURNING id INTO result;
  INSERT INTO notifications(profile_id,title,message,type,link)
  SELECT f.profile_id,'Nova publicação de empresa',company_name||' publicou na comunidade.','info','/comunidade?empresa='||target_uuid
  FROM company_followers f JOIN profiles a ON a.id=f.profile_id WHERE f.company_id=target_uuid AND f.profile_id<>actor AND a.is_active;
  RETURN result;
 END IF;
 IF action_name IN ('remove_comment','report_comment') THEN
  SELECT * INTO m FROM post_comments WHERE id=target_uuid;
  IF m.id IS NULL THEN RAISE EXCEPTION 'Comentário indisponível.'; END IF;
  IF action_name='remove_comment' THEN
   IF m.author_id<>actor THEN RAISE EXCEPTION 'Você só pode retirar seu comentário.'; END IF;
   UPDATE post_comments SET withdrawn=true WHERE id=m.id; RETURN m.id;
  END IF;
  SELECT * INTO p FROM company_posts WHERE id=m.post_id;
  IF m.hidden OR m.withdrawn THEN RAISE EXCEPTION 'Comentário indisponível.'; END IF;
 ELSE SELECT * INTO p FROM company_posts WHERE id=target_uuid; END IF;
 IF p.id IS NULL THEN RAISE EXCEPTION 'Publicação indisponível.'; END IF;
 IF action_name IN ('edit','withdraw') THEN
  IF NOT can_manage_company(p.company_id) THEN RAISE EXCEPTION 'Publicação restrita à sua empresa.'; END IF;
  IF action_name='withdraw' THEN UPDATE company_posts SET withdrawn=true,updated_at=now() WHERE id=p.id;
  ELSE
   IF p.hidden OR p.withdrawn THEN RAISE EXCEPTION 'Publicação indisponível para edição.'; END IF;
   UPDATE company_posts SET body=btrim(content),image_url=nullif(btrim(picture),''),updated_at=now() WHERE id=p.id;
  END IF;
  RETURN p.id;
 END IF;
 IF p.hidden OR p.withdrawn OR NOT EXISTS(SELECT 1 FROM companies c JOIN profiles a ON a.id=c.owner_profile_id JOIN profiles b ON b.id=p.author_id WHERE c.id=p.company_id AND a.is_active AND b.is_active) THEN RAISE EXCEPTION 'Publicação indisponível.'; END IF;
 IF action_name='like' THEN
  IF desired THEN INSERT INTO post_likes VALUES(p.id,actor) ON CONFLICT DO NOTHING;
  ELSE DELETE FROM post_likes WHERE post_id=p.id AND profile_id=actor; END IF; RETURN p.id;
 ELSIF action_name='comment' THEN
  IF (SELECT count(*) FROM post_comments WHERE author_id=actor AND created_at>now()-interval '1 hour')>=30 THEN RAISE EXCEPTION 'Limite de trinta comentários por hora.'; END IF;
  INSERT INTO post_comments(post_id,author_id,body) VALUES(p.id,actor,btrim(content)) RETURNING id INTO result;
  SELECT owner_profile_id,name INTO owner_id,company_name FROM companies WHERE id=p.company_id;
  IF owner_id<>actor THEN INSERT INTO notifications(profile_id,title,message,type,link) VALUES(owner_id,'Novo comentário',company_name||' recebeu um comentário na comunidade.','info','/comunidade?empresa='||p.company_id); END IF;
  RETURN result;
 ELSIF action_name IN ('report','report_comment') THEN
  IF (SELECT count(*) FROM community_reports WHERE reporter_id=actor AND created_at>now()-interval '1 hour')>=20 THEN RAISE EXCEPTION 'Limite de denúncias por hora.'; END IF;
  INSERT INTO community_reports(reporter_id,post_id,comment_id,reason) VALUES(actor,CASE WHEN action_name='report' THEN p.id END,CASE WHEN action_name='report_comment' THEN m.id END,btrim(content)) ON CONFLICT DO NOTHING RETURNING id INTO result;
  RETURN coalesce(result,target_uuid);
 END IF;
 RAISE EXCEPTION 'Ação desconhecida.';
END $$;

CREATE OR REPLACE FUNCTION public.admin_community_reports()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT is_super_admin() THEN RAISE EXCEPTION 'Acesso restrito ao superadministrador.'; END IF;
 RETURN coalesce((SELECT jsonb_agg(item ORDER BY created_at DESC) FROM (
 SELECT r.created_at,jsonb_build_object('id',r.id,'reason',r.reason,'created_at',r.created_at,'resolved',r.resolved,
 'kind',CASE WHEN r.comment_id IS NULL THEN 'post' ELSE 'comment' END,'target',coalesce(r.comment_id,r.post_id),
 'body',coalesce(m.body,p.body),'company_name',c.name,'hidden',coalesce(m.hidden,p.hidden),'withdrawn',coalesce(m.withdrawn,p.withdrawn)) item
 FROM community_reports r LEFT JOIN post_comments m ON m.id=r.comment_id JOIN company_posts p ON p.id=coalesce(r.post_id,m.post_id)
 JOIN companies c ON c.id=p.company_id ORDER BY r.created_at DESC LIMIT 100) q),'[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.admin_moderate_community(report_uuid uuid, hide_content boolean, resolve_report boolean DEFAULT true)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r community_reports;
BEGIN
 IF NOT is_super_admin() THEN RAISE EXCEPTION 'Acesso restrito ao superadministrador.'; END IF;
 IF hide_content IS NULL OR resolve_report IS NULL THEN RAISE EXCEPTION 'Informe a decisão.'; END IF;
 SELECT * INTO r FROM community_reports WHERE id=report_uuid FOR UPDATE;
 IF r.id IS NULL THEN RAISE EXCEPTION 'Denúncia não encontrada.'; END IF;
 IF r.comment_id IS NULL THEN UPDATE company_posts SET hidden=hide_content WHERE id=r.post_id;
 ELSE UPDATE post_comments SET hidden=hide_content WHERE id=r.comment_id; END IF;
 UPDATE community_reports SET resolved=resolve_report WHERE id=r.id;
 INSERT INTO audit_logs(actor_id,action,entity_type,entity_id,metadata)
 VALUES(auth.uid(),'community_moderation','community_report',r.id,jsonb_build_object('hidden',hide_content,'resolved',resolve_report,'post_id',r.post_id,'comment_id',r.comment_id));
END $$;
REVOKE ALL ON FUNCTION public.community_feed(uuid,boolean,timestamptz,uuid),public.community_company(uuid),public.community_action(text,uuid,text,text,boolean),public.admin_community_reports(),public.admin_moderate_community(uuid,boolean,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.community_feed(uuid,boolean,timestamptz,uuid),public.community_company(uuid) TO anon,authenticated;
GRANT EXECUTE ON FUNCTION public.community_action(text,uuid,text,text,boolean),public.admin_community_reports(),public.admin_moderate_community(uuid,boolean,boolean) TO authenticated;
COMMIT;
