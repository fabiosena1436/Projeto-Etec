import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { companiesMock } from '../../data/companies';
import * as S from './styles';

export function SponsorCarousel() {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const sponsors = companiesMock.filter(company => company.isSponsor);

  useEffect(() => {
    let animationFrameId: number;
    
    const scroll = () => {
      if (trackRef.current && !isHovered && !isDragging) {
        trackRef.current.scrollLeft += 1; // Ajuste a velocidade aqui se necessário
        
        // Reset scroll when reaching the duplicated content threshold
        if (trackRef.current.scrollLeft >= trackRef.current.scrollWidth / 2) {
          trackRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isDragging]);

  if (sponsors.length === 0) return null;

  // Duplicando a lista para criar o efeito infinito sem pulos
  const doubledSponsors = [...sponsors, ...sponsors, ...sponsors, ...sponsors];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (trackRef.current?.offsetLeft || 0));
    setScrollLeft(trackRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Velocidade do arraste
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <S.CarouselSection>
      <S.Title>Lojas Patrocinadoras</S.Title>
      <S.TrackContainer 
        ref={trackRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <S.Track>
          {doubledSponsors.map((sponsor, index) => (
            <S.SponsorCard 
              key={`${sponsor.id}-${index}`} 
              onClick={() => {
                if (!isDragging) navigate(`/patrocinador/${sponsor.id}`);
              }}
            >
              <img src={sponsor.logoUrl} alt={`Logo ${sponsor.name}`} draggable="false" />
              <div>
                <h4>{sponsor.name}</h4>
                {sponsor.slogan && <p>"{sponsor.slogan}"</p>}
              </div>
              <S.PromoButton onClick={(e) => {
                e.stopPropagation();
                if (!isDragging) navigate(`/patrocinador/${sponsor.id}`);
              }}>
                Ver promoções
              </S.PromoButton>
            </S.SponsorCard>
          ))}
        </S.Track>
      </S.TrackContainer>
    </S.CarouselSection>
  );
}
