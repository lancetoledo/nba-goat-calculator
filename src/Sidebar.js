import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trophy, CheckSquare, Square, MoreHorizontal, Edit2, Save, X, Award, Star, CircleDollarSign, Info } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const CategoryButton = React.memo(({ icon: Icon, name, onClick }) => (
  <button className="category-button" onClick={onClick}>
    <Icon size={24} />
    <span className='type'>{name}</span>
  </button>
));

const Achievement = React.memo(({ name, value, onToggle, onValueChange, isInCriteria, isNewPlayer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const isEditable = isNewPlayer || isInCriteria;

  useEffect(() => {
    setIsCompleted(typeof value === 'boolean' ? value : value > 0);
    setEditValue(value.toString());
  }, [value]);

  const handleSave = useCallback(() => {
    if (!isEditable) return;
    const newValue = editValue === '' ? 0 : parseInt(editValue, 10);
    if (isNaN(newValue)) {
      toast.error('Please enter a valid number');
      return;
    }
    onValueChange(name, newValue);
    setIsEditing(false);
    toast.success('Achievement updated successfully');
  }, [isEditable, editValue, name, onValueChange]);

  const handleToggle = useCallback(() => {
    if (!isEditable) return;
    onToggle(name);
    setIsCompleted(!isCompleted);
  }, [isEditable, name, onToggle, isCompleted]);

  const handleInputChange = useCallback((e) => {
    if (!isEditable) return;
    const inputValue = e.target.value;
    if (inputValue === '' || /^\d+$/.test(inputValue)) {
      setEditValue(inputValue);
    }
  }, [isEditable]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  }, [handleSave]);

  const startEditing = useCallback(() => {
    if (isEditable && typeof value !== 'boolean') {
      setIsEditing(true);
    }
  }, [isEditable, value]);

  return (
    <div className={`achievement ${isCompleted ? 'completed' : ''} ${isEditable ? 'criteria-based' : 'starting-point'}`}>
      {isEditable ? (
        typeof value === 'boolean' ? (
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
                onKeyDown={handleKeyPress}
                className="achievement-input"
                autoFocus
              />
            ) : (
              <span className="achievement-value" onDoubleClick={startEditing}>{value}</span>
            )}
          </>
        )
      ) : (
        <span className="trophy-emoji" style={{ fontSize: '24px', width: '24px', height: '24px', display: 'inline-block', textAlign: 'center' }}>🏆</span>
      )}
      <span className="achievement-name">{name}</span>
      {!isEditable && <Info size={24} className="starting-point-icon" title="Starting point (non-editable)" />}
      {isEditable && typeof value !== 'boolean' && !isEditing && (
        <Edit2 size={24} onClick={startEditing} className="achievement-action" />
      )}
      {isEditing && (
        <Save size={24} onClick={handleSave} className="achievement-action" />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.name === nextProps.name &&
         prevProps.value === nextProps.value &&
         prevProps.isInCriteria === nextProps.isInCriteria &&
         prevProps.isNewPlayer === nextProps.isNewPlayer;
});

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

const sanitizeKey = (key) => {
  return key.replace(/[.#$/[\]]/g, '_');
};

const Sidebar = React.memo(({ isOpen, selectedPlayer, onClose, onUpdatePlayer, allPlayers, criteria }) => {
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
      setPlayerTier(determineTier(selectedPlayer["Total GOAT Points"]));
    }
  }, [selectedPlayer]);

  const isAllAchievementsInCriteria = useCallback((achievements) => {
    if (!achievements || typeof achievements !== 'object' || !criteria || !criteria.Achievements) return false;
    return Object.keys(achievements).every(name => criteria.Achievements.hasOwnProperty(sanitizeKey(name)));
  }, [criteria]);

  const calculateGoatPoints = useCallback((achievements) => {
    if (!criteria || !criteria.Achievements) return 0;
    return Object.entries(achievements).reduce((total, [name, value]) => {
      const sanitizedName = sanitizeKey(name);
      const criteriaPoints = criteria.Achievements[sanitizedName] || 0;
      if (typeof value === 'boolean' && value) {
        return total + criteriaPoints;
      } else if (typeof value === 'number') {
        return total + (value * criteriaPoints);
      }
      return total;
    }, 0);
  }, [criteria]);

  const updatePlayerRankAndTier = useCallback((updatedPlayer) => {
    const sortedPlayers = [...allPlayers]
      .map(player => player["Player Name"] === updatedPlayer["Player Name"] ? updatedPlayer : player)
      .sort((a, b) => b["Total GOAT Points"] - a["Total GOAT Points"]);
    
    const newRank = sortedPlayers.findIndex(player => player["Player Name"] === updatedPlayer["Player Name"]) + 1;
    const newTier = determineTier(updatedPlayer["Total GOAT Points"]);
    
    return { ...updatedPlayer, rank: newRank, Tier: newTier };
  }, [allPlayers]);

  const handleGoatPointsUpdate = useCallback(() => {
    const newGoatPoints = goatPointsInput === '' ? 0 : parseInt(goatPointsInput, 10);
    if (isNaN(newGoatPoints)) {
      toast.error('Please enter a valid number for GOAT Points');
      return;
    }
    const updatedPlayer = updatePlayerRankAndTier({
      ...selectedPlayer,
      "Total GOAT Points": newGoatPoints
    });
    onUpdatePlayer(updatedPlayer);
    setGoatPoints(newGoatPoints);
    setPlayerRank(updatedPlayer.rank);
    setPlayerTier(updatedPlayer.Tier);
    setEditingGoatPoints(false);
    toast.success('GOAT Points updated successfully');
  }, [goatPointsInput, selectedPlayer, updatePlayerRankAndTier, onUpdatePlayer]);

  const handleGoatPointsKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleGoatPointsUpdate();
    }
  }, [handleGoatPointsUpdate]);

  const handleGoatPointsEdit = useCallback(() => {
    setEditingGoatPoints(true);
  }, []);

  const handleGoatPointsInputChange = useCallback((e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setGoatPointsInput(value);
    }
  }, []);

  const handleAchievementToggle = useCallback(async (achievementName) => {
    const sanitizedName = sanitizeKey(achievementName);
    if (!criteria || !criteria.Achievements || !criteria.Achievements.hasOwnProperty(sanitizedName)) {
      toast.error('This achievement cannot be toggled');
      return;
    }
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
    
    try {
      await onUpdatePlayer(updatedPlayer);
    } catch (error) {
      console.error('Error updating achievement:', error);
      toast.error('Failed to update achievement');
    }
  }, [criteria, selectedPlayer, calculateGoatPoints, onUpdatePlayer, updatePlayerRankAndTier]);

  const handleAchievementValueChange = useCallback(async (achievementName, newValue) => {
    const sanitizedName = sanitizeKey(achievementName);
    if (!criteria || !criteria.Achievements || !criteria.Achievements.hasOwnProperty(sanitizedName)) {
      toast.error('This achievement cannot be updated');
      return;
    }
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
    
    try {
      await onUpdatePlayer(updatedPlayer);
    } catch (error) {
      console.error('Error updating achievement value:', error);
      toast.error('Failed to update achievement value');
    }
  }, [criteria, selectedPlayer, calculateGoatPoints, onUpdatePlayer, updatePlayerRankAndTier]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const memoizedFilterAchievements = useCallback((achievements, category, searchTerm) => {
    if (!achievements || typeof achievements !== 'object') {
      console.error('Invalid achievements data:', achievements);
      return [];
    }
  
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
    
    const allInCriteria = isAllAchievementsInCriteria(achievements);
    
    return filteredAchievements.map(([name, value]) => ({
      name,
      value,
      isInCriteria: allInCriteria || (criteria && criteria.Achievements && criteria.Achievements.hasOwnProperty(sanitizeKey(name)))
    }));
  }, [isAllAchievementsInCriteria, criteria]);

  const memoizedAchievements = useMemo(() => {
    if (!selectedPlayer || !selectedPlayer.Achievements) {
      return null;
    }
    const filteredAchievements = memoizedFilterAchievements(selectedPlayer.Achievements, selectedCategory, searchTerm);
    if (!Array.isArray(filteredAchievements)) {
      console.error('Filtered achievements is not an array:', filteredAchievements);
      return null;
    }
    const isNewPlayer = selectedPlayer["Total GOAT Points"] === 0;
    return filteredAchievements.map(({ name, value, isInCriteria }) => (
      <Achievement 
        key={`${name}-${value}`}
        name={name} 
        value={value} 
        onToggle={handleAchievementToggle}
        onValueChange={handleAchievementValueChange}
        isInCriteria={isInCriteria}
        isNewPlayer={isNewPlayer}
      />
    ));
  }, [selectedPlayer, selectedCategory, searchTerm, memoizedFilterAchievements, handleAchievementToggle, handleAchievementValueChange]);

  const displayTier = playerTier === "Got Next Tier" ? "NXT ⬆️" : playerTier;

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <Toaster position="top-right" />
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
                    onKeyDown={handleGoatPointsKeyPress}
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
          {memoizedAchievements || <p className="no-achievements">No achievements found for this player.</p>}
        </div>
      </div>
    </div>
  );
});

export default Sidebar;