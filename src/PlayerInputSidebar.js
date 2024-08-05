import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PlayerInputSidebar = ({ isOpen, onClose, onAddPlayer, players, criteria }) => {
  const [playerName, setPlayerName] = useState('');
  const [playerImage, setPlayerImage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playerName || !playerImage) {
      toast.error('Please fill in all fields');
      return;
    }

    const newPlayer = {
      "Player Name": playerName,
      "Total GOAT Points": 0,
      "image": playerImage,
      "Tier": "Got Next Tier",
      "Achievements": criteria ? Object.keys(criteria.Achievements).reduce((acc, key) => {
        acc[key] = typeof criteria.Achievements[key] === 'number' ? 0 : false;
        return acc;
      }, {}) : {}
    };

    try {
      await onAddPlayer(newPlayer);
      setPlayerName('');
      setPlayerImage('');
      toast.success('Player added successfully');
    } catch (error) {
      console.error('Error adding player:', error);
      toast.error('Failed to add player');
    }
  };

  return (
    <div className={`player-input-sidebar ${isOpen ? 'open' : ''}`}>
      <Toaster position="top-right" />
      <button className="close-btn" onClick={onClose}><X size={24} /></button>
      <div className="sidebar-content">
        <h2>Add New Player</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="playerName">Player Name</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="playerImage">Player Image URL</label>
            <input
              type="text"
              id="playerImage"
              value={playerImage}
              onChange={(e) => setPlayerImage(e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          <button type="submit" className="submit-btn">
            <Plus size={18} />
            Add Player
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerInputSidebar;