import React from 'react';
import { H1 } from '../components/Heading.jsx';
import { Card, CardTitle, CardSubtitle } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Krin } from '../../services/krin.js';

export default function Export(){
  const [out, setOut] = React.useState('');
  const doExport = async () => { const r = await Krin.run(['export']); setOut(r.stdout || r.stderr); };
  const doImport = async () => { const r = await Krin.run(['import','/path/to/file.krin']); setOut(r.stdout || r.stderr); };
  return (
    <div className="space-y-8">
      <div><H1>Eksport / Import</H1><p className="text-stone-500">Kryptert sikkerhet ut av boksen (AES-256-GCM + pepper).</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardTitle>Eksporter</CardTitle><CardSubtitle>Lag en kryptert .krin-fil</CardSubtitle><Button onClick={doExport}>Eksporter</Button></Card>
        <Card><CardTitle>Importer</CardTitle><CardSubtitle>Gjenopprett fra .krin</CardSubtitle><Button variant="outline" onClick={doImport}>Velg fil…</Button></Card>
      </div>
      {out && <Card><pre className="whitespace-pre-wrap text-sm">{out}</pre></Card>}
    </div>
  );
}
