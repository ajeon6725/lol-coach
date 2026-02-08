import { useState, FormEvent, ChangeEvent } from 'react';
import ProfilePage from './components/ProfilePage';
import Dashboard from './components/Dashboard';

type Region = 'oce' | 'na' | 'euw' | 'eune' | 'kr' | 'jp' | 'br' | 'lan' | 'las' | 'tr' | 'ru';

type Step = 'search' | 'profile' | 'analysis';

function App() {
  const [step, setStep] = useState<Step>('search');
  const [gameName, setGameName] = useState<string>('');
  const [tagLine, setTagLine] = useState<string>('');
  const [region, setRegion] = useState<Region>('oce');
  const [selectedFilters, setSelectedFilters] = useState({
    champion: "all",
    role: "all",
    matchCount: 20,
    matches: [] as any[],
  });

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (gameName && tagLine) {
      setStep('profile');
    }
  };

  const handleGetAnalysis = (filteredMatches: any[]) => {
    setSelectedFilters(prev => ({ ...prev, matches: filteredMatches }));
    setStep('analysis');
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Step 1: Search */}
      {step === 'search' && (
        <div className="min-h-screen flex items-center justify-center px-4 relative">
          <div className="max-w-2xl w-full text-center relative z-10">
            {/* Hero Title */}
            <h1 className="font-display text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight">
              LEAGUE AI COACH
            </h1>
            <p className="text-muted text-lg md:text-xl mb-12 font-medium">
              Get personalized AI coaching to improve your gameplay
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-card border border-border rounded-xl p-8 shadow-2xl">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Game Name"
                  value={gameName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setGameName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-light placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <input
                  type="text"
                  placeholder="Tag Line (e.g., OCE)"
                  value={tagLine}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTagLine(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-light placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <select 
                  value={region} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setRegion(e.target.value as Region)}
                  className="w-full px-4 py-3 bg-dark border border-border rounded-lg text-light focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option value="oce">OCE</option>
                  <option value="na">NA</option>
                  <option value="euw">EUW</option>
                  <option value="eune">EUNE</option>
                  <option value="kr">KR</option>
                  <option value="jp">JP</option>
                  <option value="br">BR</option>
                  <option value="lan">LAN</option>
                  <option value="las">LAS</option>
                  <option value="tr">TR</option>
                  <option value="ru">RU</option>
                </select>
                <button 
                  type="submit"
                  className="w-full py-4 font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Find Summoner
                </button>
              </div>
            </form>
          </div>

          {/* Subtle background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      {/* Step 2: Profile */}
      {step === 'profile' && (
        <ProfilePage
          gameName={gameName}
          tagLine={tagLine}
          region={region}
          onGetAnalysis={handleGetAnalysis}
        />
      )}

      {/* Step 3: Analysis */}
      {step === 'analysis' && (
        <Dashboard
          gameName={gameName}
          tagLine={tagLine}
          region={region}
          filteredMatches={selectedFilters.matches}
          onBack={() => setStep('profile')}
        />
      )}
    </div>
  );
}

export default App;