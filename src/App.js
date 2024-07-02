import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoatList from './GoatList';
import Sidebar from './Sidebar';
import PlayerInputSidebar from './PlayerInputSidebar';
import './App.css';
import playersData from './players.json';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlayerInputSidebarOpen, setIsPlayerInputSidebarOpen] = useState(true);
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
    if (!isSidebarOpen) {
      setIsPlayerInputSidebarOpen(false);
    }
  };

  const togglePlayerInputSidebar = () => {
    setIsPlayerInputSidebarOpen(!isPlayerInputSidebarOpen);
    if (!isPlayerInputSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      setIsPlayerInputSidebarOpen(false);
    }
  };

  const handleUpdatePlayer = async (updatedPlayer) => {
    try {
      const updatedPlayers = players.map(player =>
        player["Player Name"] === updatedPlayer["Player Name"] ? updatedPlayer : player
      );
      
      const sortedPlayers = updatedPlayers.sort((a, b) => b["Total GOAT Points"] - a["Total GOAT Points"]);
      const rankedPlayers = sortedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1
      }));

      await updatePlayers(rankedPlayers);
      setSelectedPlayer(updatedPlayer);
      await fetchPlayers();
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  const handleAddPlayer = async (newPlayer) => {
    try {
      const updatedPlayers = [...players, newPlayer];
      const sortedPlayers = updatedPlayers.sort((a, b) => b["Total GOAT Points"] - a["Total GOAT Points"]);
      const rankedPlayers = sortedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1
      }));

      await updatePlayers(rankedPlayers);
      await fetchPlayers();
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''} ${isPlayerInputSidebarOpen ? 'player-input-sidebar-open' : ''}`}>
      <GoatList 
        isSidebarOpen={isSidebarOpen}
        isPlayerInputSidebarOpen={isPlayerInputSidebarOpen}
        toggleSidebar={toggleSidebar}
        togglePlayerInputSidebar={togglePlayerInputSidebar}
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
      <PlayerInputSidebar
        isOpen={isPlayerInputSidebarOpen}
        onClose={togglePlayerInputSidebar}
        onAddPlayer={handleAddPlayer}
        players={players}
      />
    </div>
  );
}

export default App;