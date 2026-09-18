-- =============================================================================
-- DEMO SEED REAL - Para popular banco após criar primeiro usuário empresa
-- Rode APÓS criar um usuário via cadastro e confirmar email
-- Substitua o email pelo seu usuário empresa real
-- =============================================================================

-- Este script cria dados de demonstração usando o primeiro usuário empresa encontrado
-- Útil para apresentação na cidade sem precisar cadastrar tudo manual

DO $$
DECLARE
  empresa_owner_id UUID;
  comp1_id UUID;
  comp2_id UUID;
  comp3_id UUID;
BEGIN
  -- Pega primeiro usuário empresa (ou admin) como dono das empresas demo
  SELECT id INTO empresa_owner_id FROM public.profiles WHERE role IN ('empresa','admin') ORDER BY created_at ASC LIMIT 1;

  IF empresa_owner_id IS NULL THEN
    RAISE NOTICE 'Nenhum usuário empresa encontrado. Crie um usuário empresa primeiro via cadastro!';
    RETURN;
  END IF;

  RAISE NOTICE 'Usando owner_id: %', empresa_owner_id;

  -- Empresa 1 - Supermercado Central (patrocinador)
  INSERT INTO public.companies (id, owner_profile_id, name, slug, industry, description, location, city, contact_email, slogan, is_sponsor, is_verified, logo_url)
  VALUES (
    uuid_generate_v4(),
    empresa_owner_id,
    'Supermercado Central',
    'supermercado-central',
    'Varejo',
    'Um dos supermercados mais tradicionais de Teodoro Sampaio, com 20 anos atendendo a cidade.',
    'Centro, Teodoro Sampaio',
    'Teodoro Sampaio',
    'rh@supermercadocentral.com.br',
    'Qualidade e preço baixo para a sua família.',
    true,
    true,
    'https://ui-avatars.com/api/?name=SC&background=2563eb&color=fff'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO comp1_id;

  -- Pega ID se já existia
  IF comp1_id IS NULL THEN
    SELECT id INTO comp1_id FROM public.companies WHERE slug = 'supermercado-central';
  END IF;

  -- Empresa 2 - TechSampaio
  INSERT INTO public.companies (owner_profile_id, name, slug, industry, description, location, city, contact_email, slogan, is_sponsor, is_verified, logo_url)
  VALUES (
    empresa_owner_id,
    'TechSampaio Solutions',
    'techsampaio-solutions',
    'Tecnologia da Informação',
    'Empresa de tecnologia focada em desenvolvimento de software e soluções para o comércio local.',
    'Centro, Teodoro Sampaio',
    'Teodoro Sampaio',
    'vagas@techsampaio.com.br',
    'Inovação que transforma o seu negócio.',
    true,
    true,
    'https://ui-avatars.com/api/?name=TS&background=0f172a&color=fff'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO comp2_id;

  IF comp2_id IS NULL THEN
    SELECT id INTO comp2_id FROM public.companies WHERE slug = 'techsampaio-solutions';
  END IF;

  -- Empresa 3 - Farmácia
  INSERT INTO public.companies (owner_profile_id, name, slug, industry, description, location, city, contact_email, slogan, is_sponsor, is_verified, logo_url)
  VALUES (
    empresa_owner_id,
    'Farmácia Saúde Total',
    'farmacia-saude-total',
    'Saúde',
    'Rede de farmácias com 3 unidades no município.',
    'Vila Moreno, Teodoro Sampaio',
    'Teodoro Sampaio',
    'contato@saudetotal.com.br',
    'Cuidando de você e de quem você ama.',
    true,
    true,
    'https://ui-avatars.com/api/?name=FST&background=ef4444&color=fff'
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO comp3_id;

  IF comp3_id IS NULL THEN
    SELECT id INTO comp3_id FROM public.companies WHERE slug = 'farmacia-saude-total';
  END IF;

  -- Vagas
  INSERT INTO public.jobs (company_id, title, slug, description, location, city, type, salary_text, salary_min, requirements, benefits, status, experience_level, vacancies)
  VALUES
    (comp1_id, 'Vendedor(a) de Loja', 'vendedor-loja-centro', 'Buscamos vendedor(a) proativo para atuar em nossa loja matriz no centro da cidade. Responsável por atendimento ao cliente, organização do setor e fechamento de vendas.', 'Centro, Teodoro Sampaio', 'Teodoro Sampaio', 'Presencial', 'R$ 1.600,00 + Comissão', 1600, ARRAY['Ensino Médio Completo', 'Boa comunicação', 'Experiência em vendas (diferencial)'], ARRAY['Vale Transporte', 'Vale Alimentação'], 'Ativa', 'Júnior', 2),
    (comp2_id, 'Desenvolvedor(a) Front-End Júnior', 'dev-frontend-junior', 'Ótima oportunidade para quem quer iniciar na área de tecnologia. Trabalhará na criação de interfaces modernas para nossos clientes locais e regionais.', 'Remoto (Sede em Teodoro Sampaio)', 'Teodoro Sampaio', 'Remoto', 'R$ 3.000,00', 3000, ARRAY['Conhecimento em React e TypeScript', 'Noções de Git', 'Estudante ou formado em TI'], ARRAY['Plano de Saúde', 'Auxílio Home Office', 'Plano de Carreira'], 'Ativa', 'Júnior', 1),
    (comp1_id, 'Jovem Aprendiz - Administrativo', 'jovem-aprendiz-adm', 'Apoio nas rotinas administrativas, arquivamento de documentos e atendimento telefônico. Excelente para o primeiro emprego.', 'Distrito Industrial, Teodoro Sampaio', 'Teodoro Sampaio', 'Jovem Aprendiz', 'R$ 800,00', 800, ARRAY['Idade entre 14 e 24 anos', 'Cursando ou concluído Ensino Médio'], ARRAY['Vale Transporte', 'Cursos de Qualificação'], 'Ativa', 'Estágio', 3),
    (comp3_id, 'Atendente de Farmácia', 'atendente-farmacia-vila', 'Atendimento ao balcão, organização de prateleiras e auxílio no controle de estoque.', 'Vila Moreno, Teodoro Sampaio', 'Teodoro Sampaio', 'Presencial', 'R$ 1.800,00 + Adicional', 1800, ARRAY['Ensino Médio Completo', 'Disponibilidade de horário'], ARRAY['Vale Transporte', 'Desconto em medicamentos'], 'Ativa', 'Júnior', 1),
    (comp1_id, 'Auxiliar de Logística', 'aux-logistica-piquerobi', 'Separação de mercadorias, carga e descarga de caminhões, organização do galpão.', 'Saída para Piquerobi', 'Teodoro Sampaio', 'Presencial', 'R$ 1.900,00', 1900, ARRAY['Ensino Médio Completo', 'Força física', 'Trabalho em equipe'], ARRAY['Vale Transporte', 'Refeição no Local', 'Cesta Básica'], 'Ativa', 'Júnior', 2)
  ON CONFLICT (slug) DO NOTHING;

  -- Promoções para patrocinadores
  INSERT INTO public.promotions (company_id, title, description, price, discount_price, valid_until, is_active)
  VALUES
    (comp1_id, 'Arroz 5kg', 'Arroz tipo 1, pacote de 5kg. Limite de 2 por cliente.', 25.90, 19.90, CURRENT_DATE + INTERVAL '10 days', true),
    (comp1_id, 'Óleo de Soja', 'Óleo de Soja 900ml', 7.50, 5.99, CURRENT_DATE + INTERVAL '10 days', true),
    (comp2_id, 'Consultoria de TI Gratuita', 'Agende uma hora de consultoria sem custos para o seu comércio.', NULL, NULL, CURRENT_DATE + INTERVAL '30 days', true),
    (comp3_id, 'Vitamina C', 'Vitamina C efervescente, tubo com 10 pastilhas.', 15.00, 9.99, CURRENT_DATE + INTERVAL '15 days', true)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed demo criado com sucesso! Empresas: %, %, %', comp1_id, comp2_id, comp3_id;
END $$;

-- Atualiza métricas materializadas
REFRESH MATERIALIZED VIEW public.mv_city_metrics;
