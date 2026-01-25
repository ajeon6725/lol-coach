import { useState, FormEvent, ChangeEvent } from 'react';
import './App.css';

interface MatchData {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    participants: Array<{
      summonerName: string;
      championName: string;
      kills: number;
      deaths: number;
      assists: number;
      [key: string]: any;
    }>;
    [key: string]: any;
  };
}

type Region = 'oce' | 'na' | 'euw' | 'eune' | 'kr' | 'jp' | 'br' | 'lan' | 'las' | 'tr' | 'ru';

function App() {
  const [gameName, setGameName] = useState<string>('');
  const [tagLine, setTagLine] = useState<string>('');
  const [region, setRegion] = useState<Region>('oce');
  const [loading, setLoading] = useState<boolean>(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMatchData(null);

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameName, tagLine, region })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch match data');
      }

      const data: MatchData = await response.json();
      setMatchData(data);
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
      
      {matchData && (
        <div className="match-data">
          <h2>Match Found!</h2>
          <pre>{JSON.stringify(matchData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;