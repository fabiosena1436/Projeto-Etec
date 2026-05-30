export interface Job {
  id: string;
  title: string;
  companyId: string;
  location: string;
  type: 'Presencial' | 'Remoto' | 'Estágio' | 'Jovem Aprendiz' | 'Freelancer';
  salary: string;
  requirements: string[];
  benefits: string[];
  description: string;
  postedAt: string;
  status: 'Ativa' | 'Encerrada';
}

export const jobsMock: Job[] = [
  {
    id: 'job-1',
    title: 'Vendedor(a) de Loja',
    companyId: 'comp-1',
    location: 'Centro, Teodoro Sampaio',
    type: 'Presencial',
    salary: 'R$ 1.600,00 + Comissão',
    requirements: ['Ensino Médio Completo', 'Boa comunicação', 'Experiência em vendas (diferencial)'],
    benefits: ['Vale Transporte', 'Vale Alimentação'],
    description: 'Buscamos um(a) vendedor(a) proativo para atuar em nossa loja matriz no centro da cidade. Responsável por atendimento ao cliente, organização do setor e fechamento de vendas.',
    postedAt: '2026-05-25',
    status: 'Ativa'
  },
  {
    id: 'job-2',
    title: 'Desenvolvedor(a) Front-End Júnior',
    companyId: 'comp-2',
    location: 'Remoto (Sede em Teodoro Sampaio)',
    type: 'Remoto',
    salary: 'R$ 3.000,00',
    requirements: ['Conhecimento em React e TypeScript', 'Noções de Git', 'Estudante ou formado em TI'],
    benefits: ['Plano de Saúde', 'Auxílio Home Office', 'Plano de Carreira'],
    description: 'Ótima oportunidade para quem quer iniciar na área de tecnologia. Trabalhará na criação de interfaces modernas para nossos clientes locais e regionais.',
    postedAt: '2026-05-20',
    status: 'Ativa'
  },
  {
    id: 'job-3',
    title: 'Jovem Aprendiz - Administrativo',
    companyId: 'comp-3',
    location: 'Distrito Industrial, Teodoro Sampaio',
    type: 'Jovem Aprendiz',
    salary: 'R$ 800,00',
    requirements: ['Idade entre 14 e 24 anos', 'Cursando ou concluído Ensino Médio'],
    benefits: ['Vale Transporte', 'Cursos de Qualificação'],
    description: 'Apoio nas rotinas administrativas, arquivamento de documentos e atendimento telefônico. Excelente para o primeiro emprego.',
    postedAt: '2026-05-26',
    status: 'Ativa'
  },
  {
    id: 'job-4',
    title: 'Atendente de Farmácia',
    companyId: 'comp-4',
    location: 'Vila Moreno, Teodoro Sampaio',
    type: 'Presencial',
    salary: 'R$ 1.800,00 + Adicional',
    requirements: ['Ensino Médio Completo', 'Disponibilidade de horário'],
    benefits: ['Vale Transporte', 'Desconto em medicamentos'],
    description: 'Atendimento ao balcão, organização de prateleiras e auxílio no controle de estoque.',
    postedAt: '2026-05-22',
    status: 'Ativa'
  },
  {
    id: 'job-5',
    title: 'Auxiliar de Logística',
    companyId: 'comp-5',
    location: 'Saída para Piquerobi',
    type: 'Presencial',
    salary: 'R$ 1.900,00',
    requirements: ['Ensino Médio Completo', 'Força física', 'Trabalho em equipe'],
    benefits: ['Vale Transporte', 'Refeição no Local', 'Cesta Básica'],
    description: 'Separação de mercadorias, carga e descarga de caminhões, organização do galpão.',
    postedAt: '2026-05-24',
    status: 'Ativa'
  }
];
