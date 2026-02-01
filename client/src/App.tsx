import { useState, FormEvent, ChangeEvent } from 'react';
import './App.css';
import ProfilePage from './components/ProfilePage/ProfilePage';

type Region = 'oce' | 'na' | 'euw' | 'eune' | 'kr' | 'jp' | 'br' | 'lan' | 'las' | 'tr' | 'ru';

type Step = 'search' | 'profile' | 'analysis';

function App() {
  const [step, setStep] = useState<Step>('search');
  const [gameName, setGameName] = useState<string>('');
  const [tagLine, setTagLine] = useState<string>('');
  const [region, setRegion] = useState<Region>('oce');

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (gameName && tagLine) {
      setStep('profile');
    }
  };

  const handleGetAnalysis = () => {
    setStep('analysis');
  };

  const handleBackToSearch = () => {
    setStep('search');
    setGameName('');
    setTagLine('');
  };

  return (
    <div className="app">
      {/* Step 1: Search */}
      {step === 'search' && (
        <>
          <h1>League AI Coach</h1>
          <p className="subtitle">Get personalized AI coaching to improve your gameplay</p>
          
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Game Name"
              value={gameName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setGameName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Tag Line (e.g., OCE)"
              value={tagLine}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTagLine(e.target.value)}
              required
            />
            <select 
              value={region} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setRegion(e.target.value as Region)}
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
            <button type="submit">Find Summoner</button>
          </form>
        </>
      )}

      {/* Step 2: Profile */}
      {step === 'profile' && (
        <>
          <button className="back-button" onClick={handleBackToSearch}>
            ← Back to Search
          </button>
          <ProfilePage
            gameName={gameName}
            tagLine={tagLine}
            region={region}
            onGetAnalysis={handleGetAnalysis}
          />
        </>
      )}

      {/* Step 3: Analysis (placeholder for now) */}
      {step === 'analysis' && (
        <>
          <button className="back-button" onClick={() => setStep('profile')}>
            ← Back to Profile
          </button>
          <h1>Analysis Configuration</h1>
          <p>Step 3 - To be implemented next</p>
        </>
      )}
    </div>
  );
}

export default App;
