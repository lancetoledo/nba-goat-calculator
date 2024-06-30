const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001; // Make sure this doesn't conflict with your React app port

app.use(cors());
app.use(bodyParser.json());

const playersFilePath = path.join(__dirname, 'players.json');

app.get('/api/players', (req, res) => {
  fs.readFile(playersFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error reading players data' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/players', (req, res) => {
  const updatedPlayers = req.body;
  fs.writeFile(playersFilePath, JSON.stringify(updatedPlayers, null, 2), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error writing players data' });
    }
    res.json({ message: 'Players data updated successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});