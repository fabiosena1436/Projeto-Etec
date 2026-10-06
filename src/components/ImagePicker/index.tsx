import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ImagePlus, X } from 'lucide-react';
import { prepareImage } from '../../utils/prepareImage';

const Container = styled.div`
  min-width: 0; margin: 12px 0;
  .photo-controls { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
  button { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 14px; min-height:44px; border:1px solid #cedbe7; border-radius:9px; background:#fff; color:#16344b; cursor:pointer; font:inherit; }
  button:disabled { opacity:.6; cursor:wait; }
  label { display:block; font-size:14px; font-weight:600; margin:8px 0; }
  input[type=url] { width:100%; min-width:0; box-sizing:border-box; padding:12px; border:1px solid #cedbe7; border-radius:9px; font:inherit; }
  small { display:block; color:#52687a; line-height:1.5; margin:8px 0; }
  img { display:block; width:100%; max-height:260px; object-fit:contain; margin:12px 0; border-radius:10px; background:#f3f6f9; }
  [role=alert] { color:#b42318; }
  @media(max-width:600px) { input[type=url] { font-size:16px; } }
`;

type Props = {
  id: string; label?: string; url: string; file: File | null;
  onChange: (url: string, file: File | null) => void;
  disabled?: boolean; onPreparing?: (preparing: boolean) => void;
};

export function ImagePicker({ id, label = 'Foto (opcional)', url, file, onChange, disabled, onPreparing }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const sequence = useRef(0);
  const [preview, setPreview] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState('');
  const [showLink, setShowLink] = useState(Boolean(url));
  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const value = URL.createObjectURL(file);
    setPreview(value);
    return () => URL.revokeObjectURL(value);
  }, [file]);
  useEffect(() => () => { sequence.current++; onPreparing?.(false); }, [onPreparing]);
  async function select(file: File | undefined) {
    if (!file) return;
    const request = ++sequence.current;
    setPreparing(true); onPreparing?.(true); setError('');
    try {
      const prepared = await prepareImage(file);
      if (request === sequence.current) { onChange('', prepared); setShowLink(false); }
    } catch (err) {
      if (request === sequence.current) setError(err instanceof Error ? err.message : 'Não foi possível preparar a foto.');
    } finally {
      if (request === sequence.current) { setPreparing(false); onPreparing?.(false); }
    }
  }
  return <Container>
    <label id={`${id}-label`}>{label}</label>
    <div className="photo-controls">
      <input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={disabled || preparing}
        aria-labelledby={`${id}-label`} onChange={e => { void select(e.target.files?.[0]); e.target.value = ''; }} />
      <button type="button" disabled={disabled || preparing} onClick={() => input.current?.click()}><ImagePlus size={18} />{preparing ? 'Preparando foto...' : 'Escolher da galeria'}</button>
      <button type="button" disabled={disabled || preparing} aria-expanded={showLink} onClick={() => setShowLink(!showLink)}>Usar link</button>
      {(file || url) && <button type="button" disabled={disabled || preparing} onClick={() => { onChange('', null); setError(''); }}><X size={16} />Remover foto</button>}
    </div>
    <small>JPG, PNG ou WebP, até 10 MB. A foto será reduzida automaticamente antes do envio.</small>
    {showLink && <><label htmlFor={`${id}-url`}>Endereço da foto (HTTPS)</label><input id={`${id}-url`} type="url" pattern="https://.*" maxLength={2048} disabled={disabled || preparing} value={url} placeholder="https://..." onChange={e => { onChange(e.target.value, null); setError(''); }} /></>}
    {(preview || url) && <img src={preview || url} alt="Prévia da foto escolhida" referrerPolicy="no-referrer" />}
    {file && <small>Foto pronta: {Math.ceil(file.size / 1024)} KB.</small>}
    {preparing && <small role="status">Preparando a foto para economizar espaço e internet...</small>}
    {error && <small role="alert">{error}</small>}
  </Container>;
}
