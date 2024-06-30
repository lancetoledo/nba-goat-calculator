import React from 'react';

const Sidebar = ({ isOpen, selectedPlayer, onClose }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={onClose}>&times;</button>
      <h2>{selectedPlayer ? selectedPlayer["Player Name"] : "Player Name"}</h2>
      <div className="search-container">
        <input type="text" placeholder="Search players..." className="search-bar" />
      </div>
      {/* Add more player details here */}
    </div>
  );
};

export default Sidebar;