import React from 'react';
import { H1 } from '../components/Heading.jsx';
import { Card } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import { Krin } from '../../services/krin.js';

export default function Chat(){
  const [log, setLog] = React.useState('');
  const [input, setInput] = React.useState('');

  React.useEffect(()=>{
    const offOut = Krin.onStdout((s)=> setLog(prev => prev + s));
    const offErr = Krin.onStderr((s)=> setLog(prev => prev + "\n[ERR] " + s));
    const offExit = Krin.onExit((c)=> setLog(prev => prev + `\n[exit ${c}]`));
    Krin.spawnChat().then(()=> setLog(prev => prev + 'Krin klar.\n'));
    return () => { offOut(); offErr(); offExit(); Krin.stop(); };
  },[]);

  const send = () => {
    if (!input.trim()) return;
    Krin.sendLine(input);
    setLog(prev => prev + `\n> ${input}\n`);
    setInput('');
  };

  return (
    <div className="space-y-8">
      <div><H1>Chat</H1><p className="text-stone-500">Snakk med Krin. Editorial ro, teknisk kraft.</p></div>
      <Card>
        <div className="flex gap-2">
          <input className="flex-1 border border-stone-200 rounded-md px-4 py-2" placeholder="Skriv til Krin..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} />
          <Button onClick={send}>Send</Button>
        </div>
      </Card>
      <Card><pre className="whitespace-pre-wrap text-sm">{log}</pre></Card>
    </div>
  );
}
