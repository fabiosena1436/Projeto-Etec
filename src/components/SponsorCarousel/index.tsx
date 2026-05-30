import { companiesMock } from '../../data/companies';
import * as S from './styles';

export function SponsorCarousel() {
  const sponsors = companiesMock.filter(company => company.isSponsor);

  if (sponsors.length === 0) return null;

  // Duplicando a lista para criar o efeito infinito sem pulos no CSS
  const doubledSponsors = [...sponsors, ...sponsors, ...sponsors, ...sponsors];

  return (
    <S.CarouselSection>
      <S.Title>Empresas Parceiras</S.Title>
      <S.TrackContainer>
        <S.Track>
          {doubledSponsors.map((sponsor, index) => (
            <S.SponsorCard key={`${sponsor.id}-${index}`}>
              <img src={sponsor.logoUrl} alt={`Logo ${sponsor.name}`} />
              <div>
                <h4>{sponsor.name}</h4>
                {sponsor.slogan && <p>"{sponsor.slogan}"</p>}
              </div>
            </S.SponsorCard>
          ))}
        </S.Track>
      </S.TrackContainer>
    </S.CarouselSection>
  );
}
