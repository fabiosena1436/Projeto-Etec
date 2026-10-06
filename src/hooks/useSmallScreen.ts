import { useEffect, useState } from 'react';

export function useSmallScreen() {
  const [small, setSmall] = useState(() => window.matchMedia('(max-width:700px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width:700px)');
    const update = () => setSmall(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return small;
}
