import React, { useState } from 'react';
import GoatList from './GoatList';
import Sidebar from './Sidebar';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
    }
  };

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <GoatList 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        onPlayerClick={handlePlayerClick}
        selectedPlayer={selectedPlayer}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        selectedPlayer={selectedPlayer} 
        onClose={toggleSidebar}
      />
    </div>
  );
}

export default App;