import { passwordRequirements } from '../../utils/passwordPolicy';

export function PasswordRequirements({ password, id }: { password: string; id: string }) {
  return <ul id={id} style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', fontSize: 12, lineHeight: 1.8 }}>
    {passwordRequirements(password).map(rule => <li key={rule.label} style={{ color: rule.met ? '#08745a' : '#526578' }}>
      <span aria-hidden="true">{rule.met ? '✓' : '○'} </span>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>{rule.met ? 'Atendido: ' : 'Pendente: '}</span>{rule.label}
    </li>)}
  </ul>;
}
