export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price?: number;
  discountPrice?: number;
  validUntil?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  logoUrl: string;
  description: string;
  location: string;
  contactEmail: string;
  website?: string;
  slogan?: string;
  isSponsor?: boolean;
  promotions?: Promotion[];
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
    isSponsor: true,
    promotions: [
      {
        id: 'promo-1',
        title: 'Arroz 5kg',
        description: 'Arroz tipo 1, pacote de 5kg. Limite de 2 por cliente.',
        price: 25.90,
        discountPrice: 19.90,
        validUntil: '2026-06-10'
      },
      {
        id: 'promo-2',
        title: 'Óleo de Soja',
        description: 'Óleo de Soja 900ml',
        price: 7.50,
        discountPrice: 5.99,
        validUntil: '2026-06-10'
      }
    ]
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
    isSponsor: true,
    promotions: [
      {
        id: 'promo-3',
        title: 'Consultoria de TI Gratuita',
        description: 'Agende uma hora de consultoria sem custos para o seu comércio.',
        validUntil: '2026-06-30'
      }
    ]
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
    isSponsor: true,
    promotions: [
      {
        id: 'promo-4',
        title: 'Vitamina C',
        description: 'Vitamina C efervescente, tubo com 10 pastilhas.',
        price: 15.00,
        discountPrice: 9.99,
        validUntil: '2026-06-15'
      }
    ]
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
