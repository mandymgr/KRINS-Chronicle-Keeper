# KRINS Chronicle Keeper Design System

## Designfilosofi - Kinfolk-inspirert Minimalisme

Vårt designsystem er basert på Kinfolks elegante, minimalistiske estetikk med fokus på:
- **Renhet og enkelhet** - Ingen unødvendige elementer
- **Typografi som kommunikasjon** - Tekst som visuelt verktøy
- **Generøse whitespace** - Rom til å puste
- **Subtile interaksjoner** - Diskrete hover-effekter
- **Nøytrale farger** - Tidløs eleganse

## Fargepalett

### Hovedfarger
```css
--color-primary: #2c2c2c      /* Mørk kull for hovedtekst */
--color-secondary: #959595    /* Medium grå for sekundærtekst */
--color-tertiary: #c0c0c0     /* Lys grå for subtile elementer */
--color-background: #ffffff   /* Ren hvit bakgrunn */
```

### Overflater og Grenser
```css
--color-surface: #fafafa      /* Veldig lys grå for flater */
--color-border-light: #f8f8f8 /* Veldig lyse grenser */
--color-border: #f0f0f0       /* Lyse grenser */
--color-border-medium: #e0e0e0 /* Medium grenser */
```

### Hover-tilstander
```css
--color-hover: rgba(245, 245, 245, 0.5)    /* Subtil hover */
--color-hover-strong: rgba(240, 240, 240, 0.8) /* Sterkere hover */
```

## Typografi

### Fonter
- **Display (Overskrifter):** Playfair Display - Elegant serif
- **Body (Brødtekst):** Inter - Moderne sans-serif
- **Monospace:** JetBrains Mono - Teknisk tekst

### Størrelser
```css
--text-xs: 11px      /* Små merkelapper */
--text-sm: 12px      /* Hjelptekst */
--text-base: 14px    /* Standard brødtekst */
--text-lg: 16px      /* Større brødtekst */
--text-xl: 18px      /* Undertitler */
--text-2xl: 24px     /* Små overskrifter */
--text-3xl: 28px     /* Stats og tall */
--text-4xl: 32px     /* Seksjonsoverskrifter */
--text-5xl: 48px     /* Store titler */
--text-6xl: 72px     /* Hero-titler */
```

### Letter-spacing
```css
--tracking-tight: -1px    /* Tette overskrifter */
--tracking-normal: 0      /* Normal avstand */
--tracking-wide: 1px      /* Luftig tekst */
--tracking-wider: 2px     /* Subtile labels */
--tracking-widest: 3px    /* Logo og merker */
```

## Spacing System

Generøs spacing-skala for å skape ro og balanse:

```css
--space-xs: 8px       /* Små gap */
--space-sm: 12px      /* Mellom elementer */
--space-md: 16px      /* Standard spacing */
--space-lg: 24px      /* Logo og ikoner */
--space-xl: 32px      /* Seksjoner */
--space-2xl: 40px     /* Store seksjoner */
--space-3xl: 48px     /* Container padding */
--space-4xl: 64px     /* Kortseksjon margins */
--space-5xl: 80px     /* Mellumseksjon margins */
--space-6xl: 120px    /* Store seksjon margins */
--space-7xl: 160px    /* Maksimal margins */
```

## Komponenter

### 1. Layout Komponenter

#### StandardLayout
```tsx
<StandardLayout title="KRINS Chronicle Keeper">
  {children}
</StandardLayout>
```

#### PageHero
```tsx
<PageHero 
  subtitle="Organizational Intelligence"
  title="Intelligence Dashboard"
  description="System beskrivelse..."
  stats={[
    { value: '24', label: 'Active ADRs' },
    { value: '12', label: 'Team Members' }
  ]}
/>
```

### 2. Innhold Komponenter

#### ContentSection
```tsx
<ContentSection title="Recent Activity">
  {content}
</ContentSection>
```

#### DataList
```tsx
<DataList 
  items={activities}
  renderItem={(item, index) => (
    <div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  )}
/>
```

#### ActionGrid
```tsx
<ActionGrid 
  actions={[
    {
      icon: FileText,
      title: 'Create ADR',
      description: 'Document new decisions',
      onClick: () => {}
    }
  ]}
/>
```

## Brukseksempel

```tsx
import { StandardLayout, PageHero, ContentSection, DataList, ActionGrid } from '@/components/shared/Layout'
import '@/styles/design-system.css'

export function MyPage() {
  return (
    <StandardLayout title="KRINS Chronicle Keeper">
      <PageHero 
        subtitle="System Status"
        title="Overview Dashboard"
        stats={stats}
      />
      
      <ContentSection title="Recent Updates">
        <DataList 
          items={updates}
          renderItem={(update) => (
            <div>
              <h3 className="text-lg font-medium text-primary uppercase tracking-wide">
                {update.title}
              </h3>
              <p className="text-sm text-secondary">{update.description}</p>
            </div>
          )}
        />
      </ContentSection>
      
      <ContentSection title="Quick Actions">
        <ActionGrid actions={actions} />
      </ContentSection>
    </StandardLayout>
  )
}
```

## CSS Klasser

### Typografi Klasser
```css
.display              /* Playfair Display font */
.text-primary         /* Hovedfarge */
.text-secondary       /* Sekundærfarge */
.text-tertiary        /* Tertiærfarge */
.text-xs              /* 11px */
.text-sm              /* 12px */
.text-base            /* 14px */
/* ... osv */
.font-regular         /* 400 weight */
.font-medium          /* 500 weight */
.font-semibold        /* 600 weight */
.tracking-wide        /* 1px letter-spacing */
.uppercase            /* Store bokstaver */
```

### Layout Klasser
```css
.container            /* Max-width 1300px container */
.container-narrow     /* Max-width 800px container */
.section              /* Standard seksjonsmargin */
.section-large        /* Stor seksjonsmargin */
```

### Komponent Klasser
```css
.header               /* Standard header */
.logo                 /* Logo container */
.btn                  /* Base knapp */
.btn-primary          /* Primær knapp stil */
.card                 /* Kort komponent */
.list-item            /* Liste element */
.hero                 /* Hero seksjon */
.stats-grid           /* Stats rutenett */
.action-grid          /* Action rutenett */
```

## Responsivt Design

Designsystemet inkluderer responsive breakpoints:
- **Desktop:** 1300px max container width
- **Tablet/Mobile:** Under 768px
  - Redusert padding
  - Stakket layouts
  - Mindre tekststørrelser

## Animasjoner

Subtile animasjoner for å forbedre brukeropplevelsen:

```css
.animate-rise         /* Forsiktig opp-animasjon */
.animate-rise-1       /* Med 0.1s delay */
.animate-rise-2       /* Med 0.2s delay */
/* ... osv */
```

## Implementering

1. **Import designsystemet:**
   ```tsx
   import '@/styles/design-system.css'
   ```

2. **Bruk layout komponenter:**
   ```tsx
   import { StandardLayout } from '@/components/shared/Layout'
   ```

3. **Anvend CSS klasser:**
   ```tsx
   <h1 className="display text-5xl text-primary font-regular tracking-tight">
     Overskrift
   </h1>
   ```

Dette designsystemet sikrer konsistens på tvers av alle sider i KRINS Chronicle Keeper systemet, med fokus på elegant minimalisme inspirert av Kinfolks designprinsipper.