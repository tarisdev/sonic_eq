import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsPage } from '@/options/pages/SettingsPage';
import '@/options/styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Options root container is missing.');

createRoot(container).render(
  <StrictMode>
    <SettingsPage />
  </StrictMode>,
);
