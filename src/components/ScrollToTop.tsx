import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if(target) target.scrollIntoView(); else window.scrollTo({top:0,behavior:'instant'});
      const main = document.querySelector<HTMLElement>('main');
      main?.focus({preventScroll:true});
      const title = document.querySelector('h1')?.textContent;
      document.title = title ? title + ' | Conecta Sampaio' : 'Conecta Sampaio | Empregos em Teodoro Sampaio';
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);
  return null;
}
