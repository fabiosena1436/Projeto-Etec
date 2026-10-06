import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    min-width: 320px;
    scroll-behavior: smooth;
  }

  #root { min-height: 100dvh; width: 100%; }
  :where(main, section, article, aside, header, footer, nav, form, fieldset) { min-width: 0; }

  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    -webkit-font-smoothing: antialiased;
    line-height: 1.6;
    font-family: ${({ theme }) => theme.fonts.main};
  }

  body, input, textarea, button {
    font-family: ${({ theme }) => theme.fonts.main};
    font-size: 1rem;
    font-weight: 400;

  }

  button {
    cursor: pointer;
    border: none;
    background: transparent;
    min-height: 44px;
  }

  input, select, textarea { max-width: 100%; min-width: 0; }
  input, select { min-height: 44px; }
  img, video, iframe { max-width: 100%; }
  button > svg, a > svg { flex-shrink: 0; }
  h1, h2, h3, h4 { line-height: 1.25; letter-spacing: -0.025em; }
  h1 { font-size: clamp(1.9rem, 4vw, 2.8rem); }
  p, h1, h2, h3, h4, a, label, button { overflow-wrap: anywhere; }
  ::selection { background: #c9e3fc; color: #102a43; }
  :focus-visible { outline: 3px solid #175cda; outline-offset: 4px; }
  button:disabled { cursor: not-allowed; }
  [id] { scroll-margin-top: 100px; }
  .skip-link { position: fixed; top: -80px; left: 16px; z-index: 1000; background: white; color: #102a43; padding: 12px 20px; border: 2px solid #175cda; border-radius: 10px; }
  .skip-link:focus { top: 12px; }
  @media (prefers-reduced-motion: reduce) {
    html, body { scroll-behavior: auto; }
    *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.textLight};
  }
`;
