import React, { useState, useEffect } from 'react';
import axios from 'axios'; // You'll need to install axios: npm install axios
import GoatList from './GoatList';
import Sidebar from './Sidebar';
import './App.css';
import playersData from './players.json';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [players, setPlayers] = useState(playersData.players);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/players');
      setPlayers(response.data.players);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const updatePlayers = async (updatedPlayers) => {
    try {
      await axios.post('http://localhost:3001/api/players', { players: updatedPlayers });
      setPlayers(updatedPlayers);
    } catch (error) {
      console.error('Error updating players:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }
  };

  const handleUpdatePlayer = async (updatedPlayer) => {
    try {
      const updatedPlayers = players.map(player =>
        player["Player Name"] === updatedPlayer["Player Name"] ? updatedPlayer : player
      );
      
      // Sort players by GOAT points and update ranks
      const sortedPlayers = updatedPlayers.sort((a, b) => b["Total GOAT Points"] - a["Total GOAT Points"]);
      const rankedPlayers = sortedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1
      }));

      await updatePlayers(rankedPlayers);
      setSelectedPlayer(updatedPlayer);
      // Fetch the updated data immediately
      await fetchPlayers();
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <GoatList 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        onPlayerClick={handlePlayerClick}
        selectedPlayer={selectedPlayer}
        players={players}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        selectedPlayer={selectedPlayer} 
        onClose={toggleSidebar}
        onUpdatePlayer={handleUpdatePlayer}
        allPlayers={players}
      />
    </div>
  );
}

export default App;