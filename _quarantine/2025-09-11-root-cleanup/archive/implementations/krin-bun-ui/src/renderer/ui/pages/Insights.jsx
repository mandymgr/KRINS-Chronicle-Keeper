import React from 'react';
import { H1 } from '../components/Heading.jsx';
import { Card, CardTitle, CardSubtitle } from '../components/Card.jsx';
import Stat from '../components/Stat.jsx';
import Button from '../components/Button.jsx';
import { Krin } from '../../services/krin.js';

export default function Insights(){
  const [out, setOut] = React.useState('');
  const runInsights = async () => {
    const res = await Krin.run(['insights']);
    setOut(res.stdout || res.stderr);
  };
  return (
    <div className="space-y-8">
      <div><H1>Innsikt</H1><p className="text-stone-500">Aktivitet per dag, topp minnetyper, tokenforbruk og streaks.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Stat label="Aktivitet (7d)" value="—" />
        <Stat label="Minner" value="—" />
        <Stat label="Streak" value="—" />
      </div>
      <Button variant="outline" onClick={runInsights}>Hent innsikt (CLI)</Button>
      {out && <Card><CardTitle>Output</CardTitle><CardSubtitle>krin insights</CardSubtitle><pre className="whitespace-pre-wrap text-sm">{out}</pre></Card>}
    </div>
  );
}
