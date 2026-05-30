export interface Company {
  id: string;
  name: string;
  industry: string;
  logoUrl: string;
  description: string;
  location: string;
  contactEmail: string;
  slogan?: string;
  isSponsor?: boolean;
}

export const companiesMock: Company[] = [
  {
    id: 'comp-1',
    name: 'Supermercado Central',
    industry: 'Varejo',
    logoUrl: 'https://ui-avatars.com/api/?name=SC&background=2563eb&color=fff',
    description: 'Um dos supermercados mais tradicionais de Teodoro Sampaio.',
    location: 'Centro, Teodoro Sampaio',
    contactEmail: 'rh@supermercadocentral.com.br',
    slogan: 'Qualidade e preço baixo para a sua família.',
    isSponsor: true
  },
  {
    id: 'comp-2',
    name: 'TechSampaio Solutions',
    industry: 'Tecnologia da Informação',
    logoUrl: 'https://ui-avatars.com/api/?name=TS&background=0f172a&color=fff',
    description: 'Empresa de tecnologia focada em desenvolvimento de software e soluções para o comércio local.',
    location: 'Centro, Teodoro Sampaio',
    contactEmail: 'vagas@techsampaio.com.br',
    slogan: 'Inovação que transforma o seu negócio.',
    isSponsor: true
  },
  {
    id: 'comp-3',
    name: 'Indústria Agrícola Anastaciana',
    industry: 'Agronegócio',
    logoUrl: 'https://ui-avatars.com/api/?name=IA&background=10b981&color=fff',
    description: 'Forte atuação no setor agropecuário e beneficiamento de grãos.',
    location: 'Distrito Industrial, Teodoro Sampaio',
    contactEmail: 'curriculos@iaa.com.br'
  },
  {
    id: 'comp-4',
    name: 'Farmácia Saúde Total',
    industry: 'Saúde',
    logoUrl: 'https://ui-avatars.com/api/?name=FST&background=ef4444&color=fff',
    description: 'Rede de farmácias com 3 unidades no município.',
    location: 'Vila Moreno, Teodoro Sampaio',
    contactEmail: 'contato@saudetotal.com.br',
    slogan: 'Cuidando de você e de quem você ama.',
    isSponsor: true
  },
  {
    id: 'comp-5',
    name: 'Transportadora Rápido Oeste',
    industry: 'Logística',
    logoUrl: 'https://ui-avatars.com/api/?name=RO&background=f59e0b&color=fff',
    description: 'Serviços de carga e frete para toda a região oeste paulista.',
    location: 'Rodovia Raposo Tavares, Teodoro Sampaio',
    contactEmail: 'rh@rapidooeste.com.br'
  }
];
