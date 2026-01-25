import { useState, FormEvent, ChangeEvent } from 'react';
import './App.css';

interface PlayerStats {
  championName: string;
  role: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  kda: string;
  cs: number;
  csPerMin: string;
  visionScore: number;
  gameDuration: number;
}

interface AnalysisResponse {
  playerStats: PlayerStats;
  analysis: string;
  matchData: any;
}

type Region = 'oce' | 'na' | 'euw' | 'eune' | 'kr' | 'jp' | 'br' | 'lan' | 'las' | 'tr' | 'ru';

function App() {
  const [gameName, setGameName] = useState<string>('');
  const [tagLine, setTagLine] = useState<string>('');
  const [region, setRegion] = useState<Region>('oce');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName, tagLine, region })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analysis');
      }

      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>League AI Coach</h1>
      
      <form onSubmit={handleSubmit} className="search-form">
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
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className="results">
          <div className="match-summary">
            <h2>
              {result.playerStats.championName} - {result.playerStats.role}
              <span className={result.playerStats.win ? 'win' : 'loss'}>
                {result.playerStats.win ? ' Victory' : ' Defeat'}
              </span>
            </h2>
            <div className="stats">
              <span>KDA: {result.playerStats.kills}/{result.playerStats.deaths}/{result.playerStats.assists} ({result.playerStats.kda})</span>
              <span>CS: {result.playerStats.cs} ({result.playerStats.csPerMin}/min)</span>
              <span>Vision: {result.playerStats.visionScore}</span>
              <span>Duration: {result.playerStats.gameDuration}min</span>
            </div>
          </div>

          <div className="analysis">
            <h3>AI Coaching Analysis</h3>
            <pre>{result.analysis}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;