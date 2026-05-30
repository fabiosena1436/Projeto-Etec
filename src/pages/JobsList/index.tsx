import { JobsBoard } from '../../components/JobsBoard';
import * as S from './styles';

export function JobsList() {
  return (
    <S.Container>
      <S.Header>
        <h1>Vagas Disponíveis</h1>
        <p>Encontre a oportunidade ideal para sua carreira em Teodoro Sampaio</p>
      </S.Header>

      <JobsBoard />
    </S.Container>
  );
}
