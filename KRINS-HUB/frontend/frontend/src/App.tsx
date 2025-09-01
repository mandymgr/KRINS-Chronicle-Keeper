import { FC } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { AITeam } from './pages/AITeam';
import { Patterns } from './pages/Patterns';
import { ADRs } from './pages/ADRs';
import { Search } from './pages/Search';
import { Development } from './pages/Development';
import { AITeamCoordination } from './pages/AITeamCoordination';
import { CoordinationThemeProvider } from './components/coordination';
import './styles/coordination.css';
import '../../src/styles/tokens.css';

const queryClient = new QueryClient();

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CoordinationThemeProvider>
        <Router>
          <div className="min-h-screen" style={{background: 'var(--ivory)'}}>
            <Routes>
              <Route path="/coordination" element={<AITeamCoordination />} />
              <Route path="*" element={
                <>
                  <Navigation />
                  <main className="container mx-auto px-8 py-16">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/ai-team" element={<AITeam />} />
                      <Route path="/patterns" element={<Patterns />} />
                      <Route path="/adrs" element={<ADRs />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/development" element={<Development />} />
                    </Routes>
                  </main>
                </>
              } />
            </Routes>
          </div>
        </Router>
      </CoordinationThemeProvider>
    </QueryClientProvider>
  );
};

export default App;