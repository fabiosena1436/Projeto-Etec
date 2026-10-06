import { useEffect, useId, useRef, useState } from 'react';
import styled from 'styled-components';

const Text = styled.p<{ $collapsed: boolean; $lines: number }>`
  ${({ $collapsed, $lines }) => $collapsed && `
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: ${$lines};
    max-height: ${$lines * 1.65}em;
    overflow: hidden;
  `}
`;
const Toggle = styled.button`
  && {
    margin-top: 4px;
    padding: 8px 0;
    min-height: 44px;
    border: 0;
    background: transparent;
    color: #165bb4;
  }
  &&:hover { background: transparent; text-decoration: underline; }
`;

export function PostText({ text, hasImage }: { text: string; hasImage: boolean }) {
  const paragraph = useRef<HTMLParagraphElement>(null);
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const lines = hasImage ? 3 : 4;
  useEffect(() => {
    const element = paragraph.current;
    if (!element) return;
    function measure() {
      const lineHeight = Number.parseFloat(getComputedStyle(element!).lineHeight);
      setOverflows(element!.scrollHeight > lineHeight * lines + 1);
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, lines]);
  return <>
    <Text ref={paragraph} id={id} className="postbody" $collapsed={!expanded} $lines={lines}>{text}</Text>
    {overflows && <Toggle type="button" aria-expanded={expanded} aria-controls={id} onClick={()=>setExpanded(value=>!value)}>{expanded?'Ver menos':'Ver mais'}</Toggle>}
  </>;
}
