import { companiesMock } from '../../data/companies';
import { toast } from 'sonner';
import * as S from './styles';

export function CompaniesList() {
  const handleViewJobs = (companyName: string) => {
    toast.info(`Buscando vagas de ${companyName}...`, {
      description: 'Esta funcionalidade será ativada na próxima fase.'
    });
  };

  return (
    <S.Container>
      <S.Header>
        <h1>Empresas Parceiras</h1>
        <p>Conheça as empresas de Teodoro Sampaio que estão contratando.</p>
      </S.Header>

      <S.Grid>
        {companiesMock.map(company => (
          <S.CompanyCard key={company.id}>
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} />
            ) : (
              <div className="placeholder">{company.name.charAt(0)}</div>
            )}
            <h3>{company.name}</h3>
            <span className="industry">{company.industry}</span>
            <p className="desc">{company.description}</p>
            <button onClick={() => handleViewJobs(company.name)}>
              Ver vagas da empresa
            </button>
          </S.CompanyCard>
        ))}
      </S.Grid>
    </S.Container>
  );
}