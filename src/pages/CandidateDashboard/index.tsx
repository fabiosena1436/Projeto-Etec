import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, CheckCircle, XCircle, Upload, Save, User, LayoutDashboard, Briefcase, LogOut, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { usersMock } from '../../data/users';
import { jobsMock } from '../../data/jobs';
import { useAppliedJobs } from '../../hooks/useAppliedJobs';
import { useAuth } from '../../hooks/useAuth';
import { JobsBoard } from '../../components/JobsBoard';
import { SponsorCarousel } from '../../components/SponsorCarousel';
import * as S from './styles';

export function CandidateDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentUser = usersMock[0];

  const handleLogout = () => {
    logout();
    toast.success('Você saiu da sua conta.');
    navigate('/');
  };

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
  const [editingSection, setEditingSection] = useState<'basic' | 'resume' | 'contact' | null>(null);

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
    setEditingSection(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeName(e.target.files[0].name);
      toast.success('Currículo anexado com sucesso!');
    }
  };

  return (
    <S.DashboardContainer>
      <S.WelcomeSection style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Olá, {profileData.name.split(' ')[0]}!</h1>
          <p>Aqui está o resumo das suas atividades na plataforma.</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
        >
          <LogOut size={18} />
          Sair da Conta
        </button>
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
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <S.SectionTitle style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={24} />
              Meu Perfil e Currículo
            </S.SectionTitle>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Mantenha seus dados atualizados para aumentar suas chances de ser contratado.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Informações Básicas */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: editingSection === 'basic' ? '1px solid #e2e8f0' : 'none' }}>
                <h4 style={{ fontSize: '1.125rem', color: '#0f172a', margin: 0 }}>Informações Básicas</h4>
                {editingSection !== 'basic' && (
                  <button type="button" onClick={() => setEditingSection('basic')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', background: '#eff6ff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>
                    <Edit2 size={16} /> Editar
                  </button>
                )}
              </div>
              
              {editingSection === 'basic' ? (
                <div style={{ padding: '1.5rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      <Save size={18} /> Salvar
                    </button>
                    <button type="button" onClick={() => setEditingSection(null)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#64748b', borderRadius: '8px', fontWeight: 600, border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
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
                </div>
              )}
            </div>

            {/* Resumo e Formação */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: editingSection === 'resume' ? '1px solid #e2e8f0' : 'none' }}>
                <h4 style={{ fontSize: '1.125rem', color: '#0f172a', margin: 0 }}>Resumo e Formação</h4>
                {editingSection !== 'resume' && (
                  <button type="button" onClick={() => setEditingSection('resume')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', background: '#eff6ff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>
                    <Edit2 size={16} /> Editar
                  </button>
                )}
              </div>

              {editingSection === 'resume' ? (
                <div style={{ padding: '1.5rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      <Save size={18} /> Salvar
                    </button>
                    <button type="button" onClick={() => setEditingSection(null)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#64748b', borderRadius: '8px', fontWeight: 600, border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Sobre Mim:</span>
                    <strong style={{ color: '#0f172a', fontWeight: 400, lineHeight: 1.5 }}>{profileData.about || 'Não informado'}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Formação Acadêmica:</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.education || 'Não informada'}</strong>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Habilidades:</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.skills || 'Nenhuma informada'}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contato e Anexos */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: editingSection === 'contact' ? '1px solid #e2e8f0' : 'none' }}>
                <h4 style={{ fontSize: '1.125rem', color: '#0f172a', margin: 0 }}>Contato e Anexos</h4>
                {editingSection !== 'contact' && (
                  <button type="button" onClick={() => setEditingSection('contact')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', background: '#eff6ff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}>
                    <Edit2 size={16} /> Editar
                  </button>
                )}
              </div>

              {editingSection === 'contact' ? (
                <div style={{ padding: '1.5rem', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 300px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Telefone / WhatsApp Privado</label>
                      <input type="text" name="phone" value={profileData.phone} onChange={handleInputChange} placeholder="(00) 00000-0000" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ficará visível apenas para recrutadores.</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 300px' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Anexar Currículo (PDF)</label>
                      <div style={{ position: 'relative' }}>
                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#475569' }}>
                          <Upload size={18} />
                          {resumeName || 'Clique para fazer upload'}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tamanho máximo: 5MB.</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      <Save size={18} /> Salvar
                    </button>
                    <button type="button" onClick={() => setEditingSection(null)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#64748b', borderRadius: '8px', fontWeight: 600, border: '1px solid #cbd5e1', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>WhatsApp Atual:</span>
                    <strong style={{ color: '#0f172a' }}>{profileData.phone || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Currículo Anexado:</span>
                    <strong style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {resumeName ? <><FileText size={16} color="#2563eb" /> {resumeName}</> : 'Nenhum currículo'}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </form>
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

