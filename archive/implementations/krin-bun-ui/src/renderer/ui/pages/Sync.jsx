import React from 'react';
import { H1 } from '../components/Heading.jsx';
import { Card, CardTitle, CardSubtitle } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Krin } from '../../services/krin.js';

export default function Sync(){
  const [out, setOut] = React.useState('');
  const dryRun = async () => {
    const res = await Krin.run(['sync','profile','--from','default','--to','jobb','--dry-run']);
    setOut(res.stdout || res.stderr);
  };
  return (
    <div className="space-y-8">
      <div><H1>Sync</H1><p className="text-stone-500">Synkroniser minner mellom profiler lokalt.</p></div>
      <Card>
        <CardTitle>Dry run</CardTitle>
        <CardSubtitle>Se hva som ville skjedd – ingen endringer skrives</CardSubtitle>
        <code className="text-sm">krin sync profile --from default --to jobb --dry-run</code>
        <div className="mt-4"><Button variant="outline" onClick={dryRun}>Kjør dry-run</Button></div>
      </Card>
      {out && <Card><pre className="whitespace-pre-wrap text-sm">{out}</pre></Card>}
    </div>
  );
}
