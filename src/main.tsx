import './lib/authLanding';   // must run before the router or Supabase touch the address
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LangProvider } from './lib/i18n';
import { configError } from './lib/supabase';
import './styles/app.css';
import './styles/card.css';
import './styles/buttons.css';
import './styles/niche.css';
import './styles/sig.css';
import './styles/sig2.css';
import './styles/sig3.css';
import './styles/sig4.css';
import './styles/sig5.css';
import './styles/sig6.css';
import './styles/sig7.css';
import './styles/sig8.css';
import './styles/sig9.css';
import './styles/sig10.css';
import './styles/sig11.css';
import './styles/sig12.css';
import './styles/sig13.css';
import './styles/sig14.css';
import './styles/sig15.css';
import './styles/sig16.css';
import './styles/sig21.css';
import './styles/sig20.css';
import './styles/sig23.css';
import './styles/sig17.css';
import './styles/studio.css';
import './styles/sig18.css';
import './styles/sig19.css';
import './styles/sig22.css';
import './styles/worship-engine.css';
import './styles/worship-okunami.css';
import './styles/miami.css';
import './styles/admin.css';

const root = createRoot(document.getElementById('root')!);
root.render(configError
  ? <div className="center-msg"><h1>Setup needed</h1><p>{configError}</p></div>
  : <StrictMode><LangProvider><App /></LangProvider></StrictMode>);
