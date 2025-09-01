import React, { useMemo, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Chat from './pages/Chat.jsx';
import Profiles from './pages/Profiles.jsx';
import Insights from './pages/Insights.jsx';
import Sync from './pages/Sync.jsx';
import Export from './pages/Export.jsx';
import Settings from './pages/Settings.jsx';

const routes = [
  { id:'chat', label:'Chat', element:<Chat/> },
  { id:'profiles', label:'Profiler', element:<Profiles/> },
  { id:'insights', label:'Innsikt', element:<Insights/> },
  { id:'sync', label:'Sync', element:<Sync/> },
  { id:'export', label:'Eksport/Import', element:<Export/> },
  { id:'settings', label:'Innstillinger', element:<Settings/> },
];

export default function App(){
  const [active, setActive] = useState(window.location.hash.replace('#','')||'chat');
  React.useEffect(()=>{
    const onHash = () => setActive(window.location.hash.replace('#','')||'chat');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  },[]);
  const current = useMemo(()=> routes.find(r=>r.id===active)||routes[0], [active]);
  return (
    <div className="h-full flex">
      <Sidebar items={routes.map(r=>({href:'#'+r.id,label:r.label}))} title="Krin"/>
      <main className="flex-1 p-8 overflow-auto">{current.element}</main>
    </div>
  );
}
