import React from 'react';
import { H1 } from '../components/Heading.jsx';
import { Card, CardTitle, CardSubtitle } from '../components/Card.jsx';

export default function Settings(){
  return (
    <div className="space-y-8">
      <div><H1>Innstillinger</H1><p className="text-stone-500">API-nøkkel lagres i OS-keychain. Kjør <code>krin auth set sk-ant-...</code> i terminalen.</p></div>
      <Card>
        <CardTitle>Personlighet</CardTitle>
        <CardSubtitle>Navn, tone, humor, detaljnivå</CardSubtitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-stone-500">Navn</label>
          <input className="border border-stone-200 rounded-md px-3 py-2" placeholder="Krin" />
          <label className="text-sm text-stone-500">Tone</label>
          <input className="border border-stone-200 rounded-md px-3 py-2" placeholder="varm og presis" />
          <label className="text-sm text-stone-500">Humor</label>
          <input className="border border-stone-200 rounded-md px-3 py-2" placeholder="nei" />
          <label className="text-sm text-stone-500">Detaljnivå</label>
          <input className="border border-stone-200 rounded-md px-3 py-2" placeholder="normal" />
        </div>
      </Card>
    </div>
  );
}
