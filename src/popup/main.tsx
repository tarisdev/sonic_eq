import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/popup/App';
import '@/popup/styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Popup root container is missing.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
