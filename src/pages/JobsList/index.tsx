import { JobsBoard } from '../../components/JobsBoard';
import * as S from './styles';

export function JobsList() {
  return (
    <S.Container>
      <S.Header>
        <h1>Encontre seu próximo passo</h1>
        <p>Explore oportunidades em Teodoro Sampaio. Consulte as vagas sem precisar criar uma conta.</p>
      </S.Header>

      <JobsBoard />
    </S.Container>
  );
}
