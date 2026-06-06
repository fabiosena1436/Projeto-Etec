import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, CheckCircle, XCircle, Upload, Save, User, LayoutDashboard, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { usersMock } from '../../data/users';
import { jobsMock } from '../../data/jobs';
import { useAppliedJobs } from '../../hooks/useAppliedJobs';
import { JobsBoard } from '../../components/JobsBoard';
import { SponsorCarousel } from '../../components/SponsorCarousel';
import * as S from './styles';

export function CandidateDashboard() {
  const navigate = useNavigate();
  const currentUser = usersMock[0];

  const [activeTab, setActiveTab] = useState('overview');

  const { appliedJobIds, withdrawFromJob } = useAppliedJobs();
  
  const appliedJobs = appliedJobIds
    .map(id => jobsMock.find(j => j.id === id))
    .filter(Boolean) as typeof jobsMock;

  const [profileData, setProfileData] = useState({
    name: currentUser.name || '',
    profession: currentUser.profession || '',
    city: currentUser.city || '',
    age: currentUser.age?.toString() || '',
    phone: currentUser.phone || '',
    about: currentUser.about || '',
    education: currentUser.education || '',
    skills: currentUser.skills ? currentUser.skills.join(', ') : ''
  });

  const [resumeName, setResumeName] = useState(currentUser.resumeUrl ? 'curriculo.pdf' : '');
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleWithdraw = (jobId: string) => {
    if (window.confirm('Tem certeza que deseja desistir desta vaga?')) {
      withdrawFromJob(jobId);
      toast.success('Você desistiu da vaga com sucesso.');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Perfil atualizado com sucesso!');
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeName(e.target.files[0].name);
      toast.success('Currículo anexado com sucesso!');
    }
  };

  return (
    <S.DashboardContainer>
      <S.WelcomeSection>
        <h1>Olá, {profileData.name.split(' ')[0]}!</h1>
        <p>Aqui está o resumo das suas atividades na plataforma.</p>
      </S.WelcomeSection>

      <S.TabsContainer>
        <S.TabButton 
          $active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={20} />
          Visão Geral
        </S.TabButton>
        <S.TabButton 
          $active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          Meu Perfil
        </S.TabButton>
        <S.TabButton 
          $active={activeTab === 'applications'} 
          onClick={() => setActiveTab('applications')}
        >
          <Briefcase size={20} />
          Minhas Candidaturas
        </S.TabButton>
      </S.TabsContainer>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <S.StatsGrid>
            <S.StatCard>
              <div className="icon-wrapper">
                <CheckCircle size={20} />
              </div>
              <span className="value">{appliedJobs.length}</span>
              <span className="label">Candidaturas</span>
            </S.StatCard>

            <S.StatCard>
              <div className="icon-wrapper">
                <Eye size={20} />
              </div>
              <span className="value">12</span>
              <span className="label">Visualizações no Perfil</span>
            </S.StatCard>

            <S.StatCard>
              <div className="icon-wrapper">
                <FileText size={20} />
              </div>
              <span className="value">85%</span>
              <span className="label">Perfil Completo</span>
            </S.StatCard>
          </S.StatsGrid>

          <SponsorCarousel />

          <section>
            <S.SectionTitle>
              Vagas Disponíveis
              <button onClick={() => navigate('/vagas')} style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer' }}>Ver todas na página</button>
            </S.SectionTitle>
            <JobsBoard />
          </section>
        </div>
      )}

      {activeTab === 'profile' && (
        <section style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <S.SectionTitle style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} />
              Meu Perfil e Currículo
            </S.SectionTitle>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              style={{ padding: '0.5rem 1rem', background: isEditing ? '#f1f5f9' : '#2563eb', color: isEditing ? '#475569' : 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: '0 0 -0.5rem 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Informações Básicas</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 300px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Nome Completo</label>
                  <input required type="text" name="name" value={profileData.name} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 300px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Profissão / Cargo Desejado</label>
                  <input required type="text" name="profession" value={profileData.profession} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 200px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Idade</label>
                  <input required type="number" name="age" value={profileData.age} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 300px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Cidade / Estado</label>
                  <input required type="text" name="city" value={profileData.city} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: '1rem 0 -0.5rem 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Resumo e Formação</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Sobre Mim</label>
                <textarea required rows={4} name="about" value={profileData.about} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Formação Acadêmica</label>
                <input required type="text" name="education" value={profileData.education} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Habilidades (separadas por vírgula)</label>
                <input type="text" name="skills" value={profileData.skills} onChange={handleInputChange} placeholder="Ex: Pacote Office, Atendimento ao Cliente, Vendas" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>

              <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: '1rem 0 -0.5rem 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Contato e Anexos</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 300px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Telefone / WhatsApp Privado</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={profileData.phone} 
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ficará visível apenas para recrutadores.</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 300px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Anexar Currículo (PDF)</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#475569' }}>
                      <Upload size={18} />
                      {resumeName || 'Clique para fazer upload'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tamanho máximo: 5MB.</span>
                </div>
              </div>

              <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: '#10b981', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', width: '200px', marginTop: '1rem' }}>
                <Save size={18} />
                Salvar Alterações
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ color: '#475569', fontSize: '0.875rem' }}>Mantenha seus dados atualizados para aumentar suas chances de ser contratado.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Nome Completo:</span>
                  <strong style={{ color: '#0f172a' }}>{profileData.name}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Profissão:</span>
                  <strong style={{ color: '#0f172a' }}>{profileData.profession}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Idade e Local:</span>
                  <strong style={{ color: '#0f172a' }}>{profileData.age} anos, {profileData.city}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>WhatsApp Atual:</span>
                  <strong style={{ color: '#0f172a' }}>{profileData.phone || 'Não informado'}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Habilidades:</span>
                  <strong style={{ color: '#0f172a' }}>{profileData.skills || 'Nenhuma informada'}</strong>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Currículo Anexado:</span>
                  <strong style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {resumeName ? <><FileText size={16} color="#2563eb" /> {resumeName}</> : 'Nenhum currículo'}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'applications' && (
        <section>
          <S.SectionTitle>Minhas Candidaturas Ativas</S.SectionTitle>
          {appliedJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {appliedJobs.map(job => (
                <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <h4 
                      style={{ fontSize: '1.125rem', marginBottom: '0.25rem', cursor: 'pointer', transition: 'color 0.2s' }}
                      onClick={() => navigate(`/vagas/${job.id}`)}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
                    >
                      {job.title}
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{job.type} • {job.location}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => navigate(`/vagas/${job.id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', background: '#eff6ff', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '500', transition: 'all 0.2s', cursor: 'pointer', border: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#dbeafe')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#eff6ff')}
                    >
                      <Eye size={18} />
                      Ver Vaga
                    </button>
                    <button 
                      onClick={() => handleWithdraw(job.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', background: '#fef2f2', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '500', transition: 'all 0.2s', cursor: 'pointer', border: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
                    >
                      <XCircle size={18} />
                      Desistir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'white', padding: '2rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Briefcase size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>Você não tem nenhuma candidatura ativa no momento.</p>
              <button 
                onClick={() => {
                  setActiveTab('overview');
                  setTimeout(() => navigate('/vagas'), 100);
                }} 
                style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Buscar Vagas
              </button>
            </div>
          )}
        </section>
      )}
    </S.DashboardContainer>
  );
}

