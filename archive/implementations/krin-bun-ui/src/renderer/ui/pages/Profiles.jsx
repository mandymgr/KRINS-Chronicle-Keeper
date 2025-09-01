import React from 'react';
import { H1 } from '../components/Heading.jsx';
import { Card, CardTitle, CardSubtitle } from '../components/Card.jsx';
import Button from '../components/Button.jsx';

export default function Profiles(){
  return (
    <div className="space-y-8">
      <div><H1>Profiler</H1><p className="text-stone-500">Flere hjerner: jobb, privat, prosjekt. Flytt minner trygt.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardTitle>default</CardTitle><CardSubtitle>Din vanlige kontekst</CardSubtitle><Button variant="outline">Åpne</Button></Card>
        <Card><CardTitle>jobb</CardTitle><CardSubtitle>Arbeidsprosjekter</CardSubtitle><Button variant="outline">Åpne</Button></Card>
        <Card><CardTitle>privat</CardTitle><CardSubtitle>Personlige ting</CardSubtitle><Button variant="outline">Åpne</Button></Card>
      </div>
      <Button variant="accent">Opprett ny profil</Button>
    </div>
  );
}
