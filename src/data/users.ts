export interface User {
  id: string;
  name: string;
  profession: string;
  avatarUrl: string;
  city: string;
  age: number;
  about: string;
  skills: string[];
  education: string;
  experience: {
    company: string;
    role: string;
    period: string;
  }[];
}

export const usersMock: User[] = [
  {
    id: 'user-1',
    name: 'Carlos Henrique',
    profession: 'Desenvolvedor Front-End',
    avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    city: 'Teodoro Sampaio, SP',
    age: 24,
    about: 'Apaixonado por tecnologia e focado na criação de interfaces amigáveis e responsivas. Busco minha primeira oportunidade como desenvolvedor júnior.',
    skills: ['React', 'TypeScript', 'HTML/CSS', 'Git'],
    education: 'Técnico em Desenvolvimento de Sistemas - ETEC (Cursando)',
    experience: [
      {
        company: 'Projeto Autônomo',
        role: 'Freelancer',
        period: 'Jan 2025 - Presente'
      }
    ]
  },
  {
    id: 'user-2',
    name: 'Mariana Silva',
    profession: 'Vendedora e Aux. Administrativo',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    city: 'Teodoro Sampaio, SP',
    age: 28,
    about: 'Profissional com 5 anos de experiência no comércio local. Excelente comunicação, facilidade em trabalhar com metas e atendimento ao público.',
    skills: ['Atendimento ao Cliente', 'Pacote Office', 'Vendas', 'Gestão de Estoque'],
    education: 'Ensino Médio Completo',
    experience: [
      {
        company: 'Loja Confecções Silva',
        role: 'Vendedora Responsável',
        period: 'Mar 2021 - Dez 2025'
      },
      {
        company: 'Mercadinho do Bairro',
        role: 'Operadora de Caixa',
        period: 'Fev 2019 - Fev 2021'
      }
    ]
  },
  {
    id: 'user-3',
    name: 'Lucas Almeida',
    profession: 'Estudante (Em busca do 1º Emprego)',
    avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
    city: 'Teodoro Sampaio, SP',
    age: 17,
    about: 'Estudante dedicado, comunicativo e com muita vontade de aprender. Busco uma oportunidade como Jovem Aprendiz para iniciar minha carreira profissional.',
    skills: ['Informática Básica', 'Comunicação', 'Trabalho em Equipe'],
    education: 'Ensino Médio (Cursando 3º ano)',
    experience: []
  }
];
