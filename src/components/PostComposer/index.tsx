import { useEffect, useId, useRef } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { ImagePicker } from '../ImagePicker';

const Dialog = styled.dialog`
  width: min(600px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  margin: auto;
  padding: 0;
  box-sizing: border-box;
  border: 1px solid #dde6ee;
  border-radius: 18px;
  background: white;
  color: #16344b;
  box-shadow: 0 24px 80px #102a4340;
  overflow-y: auto;
  overscroll-behavior: contain;
  &::backdrop { background: #102a4380; }
  .composer-header {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 18px 22px; border-bottom: 1px solid #e8edf2;
  }
  .composer-header h2 { margin: 0; }
  .composer-header button { flex-shrink: 0; min-width: 44px; min-height: 44px; }
  form { padding: 0 22px 22px; }
  .composer-author { margin: 14px 0; overflow-wrap: anywhere; }
  textarea { min-height: 150px; }
  .composer-footer { align-items: center; justify-content: space-between; }
  @media(max-width:600px) {
    width: calc(100% - 20px); max-height: calc(100dvh - 20px);
    .composer-header { padding: 16px; }
    form { padding: 0 16px 16px; }
  }
`;

type Props = {
  open: boolean; author: string; body: string; image: string; file: File | null;
  publishing: boolean; preparing: boolean;
  onClose: () => void; onBodyChange: (value: string) => void;
  onImageChange: (url: string, file: File | null) => void;
  onPreparing: (value: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

export function PostComposer({ open, author, body, image, file, publishing, preparing, onClose, onBodyChange, onImageChange, onPreparing, onSubmit }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) { if (element.open) element.close(); return; }
    if (!element.open) element.showModal();
    textarea.current?.focus({ preventScroll: true });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);
  return <Dialog ref={dialog} aria-labelledby={`${id}-title`} aria-modal="true"
    onCancel={event=>{event.preventDefault();if (!publishing) onClose();}}
    onClick={event=>{
      if (event.target !== event.currentTarget || publishing) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    {open && <>
      <header className="composer-header"><h2 id={`${id}-title`}>Criar publicação</h2><button type="button" disabled={publishing} onClick={onClose} aria-label="Fechar janela de publicação"><X size={20} aria-hidden="true"/></button></header>
      <form onSubmit={onSubmit} aria-busy={publishing}>
        <p className="composer-author">Publicar como <strong>{author}</strong></p>
        <label htmlFor={`${id}-body`}>Seu espaço na comunidade</label>
        <textarea ref={textarea} id={`${id}-body`} disabled={publishing} required maxLength={2000} value={body} onChange={event=>onBodyChange(event.target.value)} placeholder="Compartilhe algo do seu dia, uma notícia, uma conquista ou uma ideia para a cidade..."/>
        <ImagePicker id={`${id}-image`} url={image} file={file} onChange={onImageChange} disabled={publishing} onPreparing={onPreparing}/>
        <small>Seu nome e sua publicação ficarão públicos. Até 2.000 caracteres; use uma imagem que você tenha autorização para publicar.</small>
        <div className="actions composer-footer"><small>{body.length}/2.000</small><button className="primary" type="submit" disabled={publishing || preparing || !body.trim()}>{publishing?'Publicando...':'Publicar na comunidade'}</button></div>
      </form>
    </>}
  </Dialog>;
}
