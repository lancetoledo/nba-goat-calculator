import React, { useState, useEffect } from 'react';
import { Trophy, CheckSquare, Square, MoreHorizontal, Edit2, Save, X } from 'lucide-react';

const CategoryButton = ({ icon: Icon, name }) => (
  <button className="category-button">
    <Icon size={24} />
    <span>{name}</span>
  </button>
);

const Achievement = ({ name, value, onToggle, onValueChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onValueChange(name, editValue);
    setIsEditing(false);
  };

  if (typeof value === 'boolean') {
    return (
      <div className="achievement">
        <button onClick={() => onToggle(name)} className="achievement-toggle">
          {value ? <CheckSquare size={24} /> : <Square size={24} />}
        </button>
        <span className="achievement-name">{name}</span>
      </div>
    );
  } else if (typeof value === 'number') {
    return (
      <div className="achievement">
        {isEditing ? (
          <>
            <input 
              type="number" 
              value={editValue} 
              onChange={(e) => setEditValue(Number(e.target.value))}
              className="achievement-input"
            />
            <Save size={24} onClick={handleSave} className="achievement-action" />
          </>
        ) : (
          <>
            <span className="achievement-value">{value}</span>
            <Edit2 size={24} onClick={() => setIsEditing(true)} className="achievement-action" />
          </>
        )}
        <span className="achievement-name">{name}</span>
      </div>
    );
  }
  return null;
};

const Sidebar = ({ isOpen, selectedPlayer, onClose, onUpdatePlayer }) => {
  const [editingGoatPoints, setEditingGoatPoints] = useState(false);
  const [goatPoints, setGoatPoints] = useState(selectedPlayer?.["Total GOAT Points"] || 0);

  useEffect(() => {
    setGoatPoints(selectedPlayer?.["Total GOAT Points"] || 0);
  }, [selectedPlayer]);

  const handleGoatPointsUpdate = () => {
    onUpdatePlayer({
      ...selectedPlayer,
      "Total GOAT Points": goatPoints
    });
    console.log("UPDATED GOAT POINTS")
    setEditingGoatPoints(false);
  };

  const handleAchievementToggle = (achievementName) => {
    const updatedAchievements = {
      ...selectedPlayer.Achievements,
      [achievementName]: !selectedPlayer.Achievements[achievementName]
    };
    onUpdatePlayer({
      ...selectedPlayer,
      Achievements: updatedAchievements
    });
  };

  const handleAchievementValueChange = (achievementName, newValue) => {
    const updatedAchievements = {
      ...selectedPlayer.Achievements,
      [achievementName]: newValue
    };
    onUpdatePlayer({
      ...selectedPlayer,
      Achievements: updatedAchievements
    });
  };

  const displayTier = selectedPlayer?.Tier === "Got Next Tier" ? "NXT ⬆️" : selectedPlayer?.Tier;

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={onClose}><X size={24} /></button>
      <div className="sidebar-content">
        <div className="player-header">
          <div className="player-rank">#{selectedPlayer?.rank}</div>
          <h2 className="sidebar-player-name">{selectedPlayer ? selectedPlayer["Player Name"] : "Player Name"}</h2>
          <div className="player-tier">{displayTier}</div>
        </div>
        {selectedPlayer && (
          <div className="goat-points-container">
            <h3>G.O.A.T Points</h3>
            <div className="goat-points">
              {editingGoatPoints ? (
                <>
                  <input 
                    type="number" 
                    value={goatPoints} 
                    onChange={(e) => setGoatPoints(Number(e.target.value))}
                    className="goat-points-input"
                  />
                  <Save size={24} onClick={handleGoatPointsUpdate} className="goat-points-action" />
                </>
              ) : (
                <>
                  <span className="highlight">{selectedPlayer["Total GOAT Points"]}</span>
                  <Edit2 size={24} onClick={() => setEditingGoatPoints(true)} className="goat-points-action" />
                </>
              )}
            </div>
          </div>
        )}
        <div className="search-container">
          <input type="text" placeholder="Search players..." className="search-bar" />
        </div>
        <h3>Categories</h3>
        <div className="categories">
          <CategoryButton icon={Trophy} name="Championships" />
          <CategoryButton icon={Trophy} name="NBA Awards" />
          <CategoryButton icon={Trophy} name="Rookie Achievements" />
          <CategoryButton icon={Trophy} name="Misc" />
          <button className="more-categories"><MoreHorizontal size={24} /></button>
        </div>
        <div className="achievements">
          <h3>Achievements</h3>
          {selectedPlayer && selectedPlayer.Achievements ? (
            Object.entries(selectedPlayer.Achievements).map(([name, value]) => (
              <Achievement 
                key={name} 
                name={name} 
                value={value} 
                onToggle={handleAchievementToggle}
                onValueChange={handleAchievementValueChange}
              />
            ))
          ) : (
            <p className="no-achievements">You haven't added achievements to the player yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;