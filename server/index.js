require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getMatchData } = require('./riot');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  try {
    const { gameName, tagLine, region } = req.body;
    
    // Add this debug line:
    console.log('Received:', { gameName, tagLine, region });
    
    const matchData = await getMatchData(gameName, tagLine, region);
    res.json(matchData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));