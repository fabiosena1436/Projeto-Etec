import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Home, Search, Bookmark, User as UserIcon, Building, PlusCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { companiesService } from '../../services/supabase/companies.service';
import * as S from './styles';

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, role, logout, isEmpresa } = useAuth();
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    if (!isEmpresa) return;
    companiesService.getMyCompany().then(c => setCompanyName(c?.name || null)).catch(() => {});
  }, [isEmpresa]);

  const isActive = (path: string) => location.pathname === path;
  const displayName = isEmpresa ? (companyName || profile?.full_name || 'Minha Empresa') : (profile?.full_name || 'Candidato');
  const myProfilePath = `/candidato/${profile?.id}`;

  const handleLogout = async () => {
    await logout();
    toast.success('Você saiu da sua conta.');
    navigate('/', { replace: true });
  };

  return (
    <S.LayoutContainer>
      <S.TopBar>
        <S.TopBarContent>
          <S.Brand
            onClick={() => navigate(role === 'empresa' ? '/empresa/painel' : '/candidato/painel')}
            style={{ cursor: 'pointer' }}
          >
            <Briefcase size={24} />
            <span>Conecta jovens</span>
          </S.Brand>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isEmpresa ? (
              <S.ProfileMenu onClick={() => navigate('/empresa/painel')} title="Painel da empresa">
                <span>{displayName}</span>
                <div className="avatar" style={{ backgroundColor: '#0f172a' }}>
                  <Building size={16} color="white" />
                </div>
              </S.ProfileMenu>
            ) : (
              <S.ProfileMenu onClick={() => navigate(myProfilePath)} title="Ver meu perfil público">
                <span>{displayName}</span>
                <div className="avatar" style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                  {!profile?.avatar_url && displayName.charAt(0).toUpperCase()}
                </div>
              </S.ProfileMenu>
            )}
            <button
              onClick={handleLogout}
              title="Sair"
              aria-label="Sair da conta"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </S.TopBarContent>
      </S.TopBar>

      <S.MainContent>
        <Outlet />
      </S.MainContent>

      <S.BottomNav>
        {isEmpresa ? (
          <>
            <S.NavItem $active={isActive('/empresa/painel')} onClick={() => navigate('/empresa/painel')}>
              <Building size={24} />
              <span>Painel</span>
            </S.NavItem>
            <S.NavItem $active={isActive('/empresa/vaga/nova')} onClick={() => navigate('/empresa/vaga/nova')}>
              <PlusCircle size={24} />
              <span>Nova Vaga</span>
            </S.NavItem>
            <S.NavItem $active={isActive('/vagas')} onClick={() => navigate('/vagas')}>
              <Search size={24} />
              <span>Vagas</span>
            </S.NavItem>
          </>
        ) : (
          <>
            <S.NavItem $active={isActive('/candidato/painel')} onClick={() => navigate('/candidato/painel')}>
              <Home size={24} />
              <span>Início</span>
            </S.NavItem>
            <S.NavItem $active={isActive('/vagas')} onClick={() => navigate('/vagas')}>
              <Search size={24} />
              <span>Vagas</span>
            </S.NavItem>
            <S.NavItem $active={isActive('/candidato/salvas')} onClick={() => navigate('/candidato/salvas')}>
              <Bookmark size={24} />
              <span>Salvas</span>
            </S.NavItem>
            <S.NavItem $active={isActive(myProfilePath)} onClick={() => navigate(myProfilePath)}>
              <UserIcon size={24} />
              <span>Perfil</span>
            </S.NavItem>
          </>
        )}
      </S.BottomNav>
    </S.LayoutContainer>
  );
}
