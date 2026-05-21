import Header from './Header'

export default function PageShell({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh', background: '#FAFAFA' }}>
      <Header />
      <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {children}
      </main>
    </div>
  )
}
