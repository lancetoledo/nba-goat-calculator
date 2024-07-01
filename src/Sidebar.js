import React, { useState, useEffect } from 'react';
import { Trophy, CheckSquare, Square, MoreHorizontal, Edit2, Save, X, Award, Star, CircleDollarSign } from 'lucide-react';
import criteria from './criteria.json';

const CategoryButton = ({ icon: Icon, name, onClick }) => (
  <button className="category-button" onClick={onClick}>
    <Icon size={24} />
    <span className='type'>{name}</span>
  </button>
);

const Achievement = ({ name, value, onToggle, onValueChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsCompleted(typeof value === 'boolean' ? value : value > 0);
    setEditValue(value.toString());
  }, [value]);

  const handleSave = () => {
    const newValue = editValue === '' ? 0 : parseInt(editValue, 10);
    onValueChange(name, newValue);
    setIsEditing(false);
  };

  const handleToggle = () => {
    onToggle(name);
    setIsCompleted(!isCompleted);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === '' || /^\d+$/.test(inputValue)) {
      setEditValue(inputValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const startEditing = () => {
    if (typeof value !== 'boolean') {
      setIsEditing(true);
    }
  };

  return (
    <div className={`achievement ${isCompleted ? 'completed' : ''}`}>
      {typeof value === 'boolean' ? (
        <button onClick={handleToggle} className="achievement-toggle">
          {value ? <CheckSquare size={24} /> : <Square size={24} />}
        </button>
      ) : (
        <>
          {isEditing ? (
            <input 
              type="text" 
              value={editValue} 
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="achievement-input"
              autoFocus
            />
          ) : (
            <span className="achievement-value" onDoubleClick={startEditing}>{value}</span>
          )}
        </>
      )}
      <span className="achievement-name">{name}</span>
      {typeof value !== 'boolean' && !isEditing && (
        <Edit2 size={24} onClick={startEditing} className="achievement-action" />
      )}
      {isEditing && (
        <Save size={24} onClick={handleSave} className="achievement-action" />
      )}
    </div>
  );
};

const achievementCategories = {
  Championships: ['Championship', 'Finals'],
  'NBA Awards': ['MVP', 'DPOY', 'All-Star', 'All-NBA', 'All-Defensive'],
  'Rookie Achievements': ['Rookie', 'rookie'],
  Misc: [],
};

const categorizeAchievement = (achievementName) => {
  for (const [category, keywords] of Object.entries(achievementCategories)) {
    if (keywords.some(keyword => achievementName.includes(keyword))) {
      return category;
    }
  }
  return 'Misc';
};

const determineTier = (points) => {
  if (points >= 6500000) return "Tier 1";
  if (points >= 5100000) return "Tier 2";
  if (points >= 3700000) return "Tier 3";
  if (points >= 2300000) return "Tier 4";
  if (points >= 900000) return "Tier 5";
  return "Got Next Tier";
};

const Sidebar = ({ isOpen, selectedPlayer, onClose, onUpdatePlayer, allPlayers }) => {
  const [editingGoatPoints, setEditingGoatPoints] = useState(false);
  const [goatPoints, setGoatPoints] = useState(selectedPlayer?.["Total GOAT Points"] || 0);
  const [goatPointsInput, setGoatPointsInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerRank, setPlayerRank] = useState(selectedPlayer?.rank || 0);
  const [playerTier, setPlayerTier] = useState(selectedPlayer?.Tier || "Got Next Tier");
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedPlayer) {
      setGoatPoints(selectedPlayer["Total GOAT Points"] || 0);
      setGoatPointsInput(selectedPlayer["Total GOAT Points"]?.toString() || '');
      setPlayerRank(selectedPlayer.rank || 0);
      setPlayerTier(selectedPlayer.Tier || "Got Next Tier");
    }
  }, [selectedPlayer]);

  const calculateGoatPoints = (achievements) => {
    return Object.entries(achievements).reduce((total, [name, value]) => {
      const criteriaPoints = criteria.Achievements[name] || 0;
      if (typeof value === 'boolean' && value) {
        return total + criteriaPoints;
      } else if (typeof value === 'number') {
        return total + (value * criteriaPoints);
      }
      return total;
    }, 0);
  };

  

  const updatePlayerRankAndTier = (updatedPlayer) => {
    const sortedPlayers = [...allPlayers]
      .map(player => player["Player Name"] === updatedPlayer["Player Name"] ? updatedPlayer : player)
      .sort((a, b) => b["Total GOAT Points"] - a["Total GOAT Points"]);
    
    const newRank = sortedPlayers.findIndex(player => player["Player Name"] === updatedPlayer["Player Name"]) + 1;
    const newTier = determineTier(updatedPlayer["Total GOAT Points"]);
    
    return { ...updatedPlayer, rank: newRank, Tier: newTier };
  };

  const handleGoatPointsUpdate = () => {
    const newGoatPoints = goatPointsInput === '' ? 0 : parseInt(goatPointsInput, 10);
    const updatedPlayer = updatePlayerRankAndTier({
      ...selectedPlayer,
      "Total GOAT Points": newGoatPoints
    });
    onUpdatePlayer(updatedPlayer);
    setGoatPoints(newGoatPoints);
    setPlayerRank(updatedPlayer.rank);
    setPlayerTier(updatedPlayer.Tier);
    setEditingGoatPoints(false);
  };

  const handleGoatPointsKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGoatPointsUpdate();
    }
  };

  const handleGoatPointsEdit = () => {
    setEditingGoatPoints(true);
    setGoatPointsInput(goatPoints.toString());
  };

  const handleGoatPointsInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setGoatPointsInput(value);
    }
  };

  const handleAchievementToggle = (achievementName) => {
    const updatedAchievements = {
      ...selectedPlayer.Achievements,
      [achievementName]: !selectedPlayer.Achievements[achievementName]
    };
    const newGoatPoints = calculateGoatPoints(updatedAchievements);
    const updatedPlayer = updatePlayerRankAndTier({
      ...selectedPlayer,
      Achievements: updatedAchievements,
      "Total GOAT Points": newGoatPoints
    });
    onUpdatePlayer(updatedPlayer);
    setGoatPoints(newGoatPoints);
    setPlayerRank(updatedPlayer.rank);
    setPlayerTier(updatedPlayer.Tier);
  };

  const handleAchievementValueChange = (achievementName, newValue) => {
    const updatedAchievements = {
      ...selectedPlayer.Achievements,
      [achievementName]: newValue
    };
    const newGoatPoints = calculateGoatPoints(updatedAchievements);
    const updatedPlayer = updatePlayerRankAndTier({
      ...selectedPlayer,
      Achievements: updatedAchievements,
      "Total GOAT Points": newGoatPoints
    });
    onUpdatePlayer(updatedPlayer);
    setGoatPoints(newGoatPoints);
    setPlayerRank(updatedPlayer.rank);
    setPlayerTier(updatedPlayer.Tier);
  };

  const filterAchievements = (achievements, category, searchTerm) => {
    let filteredAchievements = Object.entries(achievements);
    
    if (category !== 'All') {
      filteredAchievements = filteredAchievements.filter(([name]) => categorizeAchievement(name) === category);
    }
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredAchievements = filteredAchievements.filter(([name]) => 
        name.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    return filteredAchievements;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const displayTier = playerTier === "Got Next Tier" ? "NXT ⬆️" : playerTier;

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={onClose}><X size={24} /></button>
      <div className="sidebar-content">
        <div className="player-header">
          <div className="player-rank">#{playerRank}</div>
          <h2 className="sidebar-player-name">{selectedPlayer ? selectedPlayer["Player Name"] : "Player Name"}</h2>
          <div className="player-tier">{displayTier}</div>
        </div>
      {selectedPlayer && (
        <div className="goat-points-container">
          <h2>G.O.A.T Points</h2>
          <div className="goat-points">
            {editingGoatPoints ? (
              <>
                <input
                  type="text"
                  value={goatPointsInput}
                  onChange={handleGoatPointsInputChange}
                  onKeyPress={handleGoatPointsKeyPress}
                  className="goat-points-input"
                  autoFocus
                />
                <button onClick={handleGoatPointsUpdate} className="goat-points-action">
                  <Save size={24} />
                </button>
              </>
            ) : (
              <span className="highlight" onDoubleClick={handleGoatPointsEdit}>
                {goatPoints}
              </span>
            )}
          </div>
        </div>
      )}
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search achievements..." 
            className="search-bar"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <h3>Categories</h3>
        <div className="categories">
          <CategoryButton icon={Trophy} name="Championships" onClick={() => setSelectedCategory('Championships')} />
          <CategoryButton icon={Award} name="NBA Awards" onClick={() => setSelectedCategory('NBA Awards')} />
          <CategoryButton icon={Star} name="Rookie Achievements" onClick={() => setSelectedCategory('Rookie Achievements')} />
          <CategoryButton icon={CircleDollarSign} name="Misc" onClick={() => setSelectedCategory('Misc')} />
          <button className="more-categories" onClick={() => setIsModalOpen(true)}><MoreHorizontal size={24} /></button>
        </div>
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h2>All Categories</h2>
              <div className="category-list">
                {['All', ...Object.keys(achievementCategories)].map((category) => (
                  <button
                    key={category}
                    className="category-item"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsModalOpen(false);
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        )}
        <div className="achievements">
          <h3>Achievements - {selectedCategory}</h3>
          {selectedPlayer && selectedPlayer.Achievements ? (
            filterAchievements(selectedPlayer.Achievements, selectedCategory, searchTerm).map(([name, value]) => (
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