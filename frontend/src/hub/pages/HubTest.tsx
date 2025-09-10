// KRINS Developer Hub - Simple Test Page

export default function HubTest() {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      color: 'var(--gray-800)',
      background: 'var(--gray-50)',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{
        fontSize: '2rem',
        marginBottom: '1rem',
        color: '#10b981'
      }}>
        🎉 HUB FUNGERER!
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Du er nå inne i KRINS Developer Hub!
      </p>
      <div style={{
        background: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <p><strong>URL:</strong> /hub</p>
        <p><strong>Status:</strong> ✅ Tilkoblet</p>
        <p><strong>Tidspunkt:</strong> {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}