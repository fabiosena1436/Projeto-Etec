import React from 'react';
import * as S from './styles';

export const CardJobSkeleton: React.FC = () => {
  return (
    <S.Container>
      <S.Header>
        <S.LogoSkeleton />
        <S.InfoSkeleton>
          <S.TitleSkeleton />
          <S.CompanySkeleton />
        </S.InfoSkeleton>
      </S.Header>
      <S.TagsSkeleton>
        <S.TagSkeleton />
        <S.TagSkeleton />
        <S.TagSkeleton />
      </S.TagsSkeleton>
      <S.FooterSkeleton>
        <S.ButtonSkeleton />
      </S.FooterSkeleton>
    </S.Container>
  );
};
