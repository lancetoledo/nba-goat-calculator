import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trophy, CheckSquare, Square, MoreHorizontal, Edit2, Save, X, Award, Star, CircleDollarSign, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const CategoryButton = React.memo(({ icon: Icon, name, onClick }) => (
  <button className="category-button" onClick={onClick}>
    <Icon size={24} />
    <span className='type'>{name}</span>
  </button>
));

const Achievement = React.memo(({ name, originalName, value, onToggle, onValueChange, isUserPlayer, isCompleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    setEditValue(value.toString());
  }, [value]);

  const handleSave = useCallback(() => {
    const newValue = editValue === '' ? 0 : parseInt(editValue, 10);
    if (isNaN(newValue)) {
      toast.error('Please enter a valid number');
      return;
    }
    onValueChange(originalName, newValue);
    setIsEditing(false);
  }, [editValue, originalName, onValueChange]);

  const handleToggle = useCallback(() => {
    onToggle(originalName);
  }, [originalName, onToggle]);

  const handleInputChange = useCallback((e) => {
    const inputValue = e.target.value;
    if (inputValue === '' || /^\d+$/.test(inputValue)) {
      setEditValue(inputValue);
    }
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  }, [handleSave]);

  const startEditing = useCallback(() => {
    if (typeof value !== 'boolean' && isUserPlayer) {
      setIsEditing(true);
    }
  }, [value, isUserPlayer]);

  return (
    <div className={`achievement ${isCompleted ? 'completed' : ''} ${isUserPlayer ? 'user-player' : 'real-player'}`}>
      {isUserPlayer ? (
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
        <span className="trophy-emoji">🏆</span>
      )}
      <span className="achievement-name">{name}</span>
      {isUserPlayer && typeof value !== 'boolean' && (
        isEditing ? (
          <Save size={24} onClick={handleSave} className="achievement-action" />
        ) : (
          <Edit2 size={24} onClick={startEditing} className="achievement-action" />
        )
      )}
    </div>
  );
});

const achievementCategories = {
  Completed: [],
  Championships: ['Championship', 'Finals', 'champion'],
  'NBA Awards': ['MVP', 'DPOY', 'All-Star', 'All-NBA', 'All-Defensive'],
  'Rookie Achievements': ['Rookie', 'rookie'],
  Misc: [],
};

const categorizeAchievement = (achievementName, achievementValue, isCompleted) => {
  if (isCompleted) {
    return 'Completed';
  }

  for (const [category, keywords] of Object.entries(achievementCategories)) {
    if (keywords.some(keyword => achievementName.toLowerCase().includes(keyword.toLowerCase()))) {
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

const formatAchievementName = (name) => {
  name = name.replace(/_/g, ' ').trim();
  name = name.replace(/(\d+)(st|nd|rd|th)/gi, (match, p1, p2) => `${p1}${p2.toLowerCase()}`);
  let words = name.split(' ');
  words = words.map(word => {
    const lowerWord = word.toLowerCase();
    if (['mvp', 'dpoy', 'nba', 'fg', 'fgm', 'ovr', '3pm'].includes(lowerWord)) {
      return word.toUpperCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  name = words.join(' ');
  name = name
    .replace(/(\d+)([A-Z])/g, '$1 $2')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/ And /g, ' and ')
    .replace(/ In /g, ' in ')
    .replace(/ With /g, ' with ')
    .replace(/ As /g, ' as ')
    .replace(/ On /g, ' on ')
    .replace(/ For /g, ' for ')
    .replace(/ To /g, ' to ')
    .replace(/ The /g, ' the ')
    .replace(/ Of /g, ' of ')
    .replace(/ A /g, ' a ')
    .replace(/ From /g, ' from ')
    .trim();
  return name;
};

const Sidebar = React.memo(({ isOpen, selectedPlayer, onClose, onUpdatePlayer, allPlayers, criteria, isDemoMode }) => {
  const [editingGoatPoints, setEditingGoatPoints] = useState(false);
  const [goatPoints, setGoatPoints] = useState(selectedPlayer?.["Total GOAT Points"] || 0);
  const [goatPointsInput, setGoatPointsInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerRank, setPlayerRank] = useState(selectedPlayer?.rank || 0);
  const [playerTier, setPlayerTier] = useState(selectedPlayer?.Tier || "Got Next Tier");
  const [searchTerm, setSearchTerm] = useState('');
  const [localPlayerData, setLocalPlayerData] = useState(null);

  useEffect(() => {
    if (selectedPlayer) {
      setGoatPoints(selectedPlayer["Total GOAT Points"] || 0);
      setGoatPointsInput(selectedPlayer["Total GOAT Points"]?.toString() || '');
      setPlayerRank(selectedPlayer.rank || 0);
      setPlayerTier(determineTier(selectedPlayer["Total GOAT Points"]));
      setLocalPlayerData(isDemoMode ? { ...selectedPlayer } : null);
    }
  }, [selectedPlayer, isDemoMode]);

  const isUserPlayer = useCallback((player) => {
    if (!player || !criteria) return false;
    const playerAchievementsKey = Object.keys(player).find(key => key.toLowerCase() === 'achievements');
    const criteriaAchievementsKey = Object.keys(criteria).find(key => key.toLowerCase() === 'achievements');
    if (!playerAchievementsKey || !criteriaAchievementsKey) return false;
    const playerAchievements = player[playerAchievementsKey];
    const criteriaAchievements = criteria[criteriaAchievementsKey];
    if (!playerAchievements || !criteriaAchievements) return false;
    const playerKeys = Object.keys(playerAchievements);
    const criteriaKeys = Object.keys(criteriaAchievements);
    return playerKeys.length === criteriaKeys.length && playerKeys.every(key => criteriaKeys.includes(key));
  }, [criteria]);

  const memoizedIsUserPlayer = useMemo(() => isUserPlayer(selectedPlayer), [isUserPlayer, selectedPlayer]);

  const getPlayerAchievements = useCallback((player) => {
    const achievementsKey = Object.keys(player).find(key => key.toLowerCase() === 'achievements');
    return player[achievementsKey] || {};
  }, []);

  const calculateGoatPoints = useCallback((achievements) => {
    if (!criteria) return 0;
    
    const criteriaAchievementsKey = Object.keys(criteria).find(key => key.toLowerCase() === 'achievements');
    if (!criteriaAchievementsKey) return 0;
  
    const criteriaAchievements = criteria[criteriaAchievementsKey];
  
    return Object.entries(achievements).reduce((total, [name, value]) => {
      const criteriaPoints = criteriaAchievements[name] || 0;
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

  const updateLocalPlayerData = useCallback((updatedPlayer) => {
    setLocalPlayerData(updatedPlayer);
    setGoatPoints(updatedPlayer["Total GOAT Points"]);
    setPlayerRank(updatedPlayer.rank);
    setPlayerTier(determineTier(updatedPlayer["Total GOAT Points"]));
    onUpdatePlayer(updatedPlayer);  // Notify parent component of the update
  }, [onUpdatePlayer]);

  const handleGoatPointsUpdate = useCallback(() => {
    const newGoatPoints = goatPointsInput === '' ? 0 : parseInt(goatPointsInput, 10);
    if (isNaN(newGoatPoints)) {
      toast.error('Please enter a valid number for GOAT Points');
      return;
    }
    const updatedPlayer = updatePlayerRankAndTier({
      ...(isDemoMode ? localPlayerData : selectedPlayer),
      "Total GOAT Points": newGoatPoints
    });
    
    if (isDemoMode) {
      updateLocalPlayerData(updatedPlayer);
    } else {
      onUpdatePlayer(updatedPlayer);
    }
    setEditingGoatPoints(false);
    toast.success(`GOAT Points updated successfully${isDemoMode ? ' in Demo Mode' : ''}`);
  }, [goatPointsInput, selectedPlayer, localPlayerData, updatePlayerRankAndTier, onUpdatePlayer, isDemoMode, updateLocalPlayerData]);

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
    if (!memoizedIsUserPlayer) {
      toast.error('This achievement cannot be toggled for real players');
      return;
    }
    const playerToUpdate = isDemoMode ? localPlayerData : selectedPlayer;
    const playerAchievements = getPlayerAchievements(playerToUpdate);
    const updatedAchievements = {
      ...playerAchievements,
      [achievementName]: !playerAchievements[achievementName]
    };
    const newGoatPoints = calculateGoatPoints(updatedAchievements);
    const updatedPlayer = updatePlayerRankAndTier({
      ...playerToUpdate,
      Achievements: updatedAchievements,
      "Total GOAT Points": newGoatPoints
    });
    
    if (isDemoMode) {
      updateLocalPlayerData(updatedPlayer);
      toast.success('Achievement updated successfully in Demo Mode');
    } else {
      try {
        await onUpdatePlayer(updatedPlayer);
        toast.success('Achievement updated successfully');
      } catch (error) {
        console.error('Error updating achievement:', error);
        toast.error('Failed to update achievement');
      }
    }
  }, [memoizedIsUserPlayer, selectedPlayer, localPlayerData, getPlayerAchievements, calculateGoatPoints, updatePlayerRankAndTier, isDemoMode, updateLocalPlayerData, onUpdatePlayer]);

  const handleAchievementValueChange = useCallback(async (achievementName, newValue) => {
    if (!memoizedIsUserPlayer) {
      toast.error('This achievement cannot be updated for real players');
      return;
    }
    const playerToUpdate = isDemoMode ? localPlayerData : selectedPlayer;
    const playerAchievements = getPlayerAchievements(playerToUpdate);
    const updatedAchievements = {
      ...playerAchievements,
      [achievementName]: newValue
    };
    const newGoatPoints = calculateGoatPoints(updatedAchievements);
    const updatedPlayer = updatePlayerRankAndTier({
      ...playerToUpdate,
      Achievements: updatedAchievements,
      "Total GOAT Points": newGoatPoints
    });
    
    if (isDemoMode) {
      updateLocalPlayerData(updatedPlayer);
      toast.success('Achievement value updated successfully in Demo Mode');
    } else {
      try {
        await onUpdatePlayer(updatedPlayer);
        toast.success('Achievement value updated successfully');
      } catch (error) {
        console.error('Error updating achievement value:', error);
        toast.error('Failed to update achievement value');
      }
    }
  }, [memoizedIsUserPlayer, selectedPlayer, localPlayerData, getPlayerAchievements, calculateGoatPoints, updatePlayerRankAndTier, isDemoMode, updateLocalPlayerData, onUpdatePlayer]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const memoizedFilterAchievements = useCallback((achievements, category, searchTerm) => {
    if (!achievements || typeof achievements !== 'object') {
      return [];
    }

    let filteredAchievements = Object.entries(achievements);

    filteredAchievements = filteredAchievements.map(([name, value]) => {
      const isCompleted = typeof value === 'boolean' ? value : (typeof value === 'number' && value > 0);
      return { 
        name: formatAchievementName(name), 
        originalName: name, 
        value, 
        isCompleted 
      };
    });

    if (category !== 'All') {
      filteredAchievements = filteredAchievements.filter(({ originalName, value, isCompleted }) => 
        categorizeAchievement(originalName, value, isCompleted) === category
      );
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredAchievements = filteredAchievements.filter(({ name }) => 
        name.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return filteredAchievements;
  }, []);

  const memoizedAchievements = useMemo(() => {
    const playerToDisplay = isDemoMode ? localPlayerData : selectedPlayer;
    if (!playerToDisplay) {
      return null;
    }

    const playerAchievements = getPlayerAchievements(playerToDisplay);
    if (!playerAchievements) {
      return null;
    }

    const filteredAchievements = memoizedFilterAchievements(playerAchievements, selectedCategory, searchTerm);

    if (!Array.isArray(filteredAchievements)) {
      return null;
    }

    return filteredAchievements.map(({ name, originalName, value, isCompleted }) => (
      <Achievement 
        key={originalName}
        name={name} 
        originalName={originalName}
        value={value} 
        onToggle={handleAchievementToggle}
        onValueChange={handleAchievementValueChange}
        isUserPlayer={memoizedIsUserPlayer}
        isCompleted={isCompleted}
      />
    ));
  }, [isDemoMode, localPlayerData, selectedPlayer, getPlayerAchievements, memoizedFilterAchievements, selectedCategory, searchTerm, handleAchievementToggle, handleAchievementValueChange, memoizedIsUserPlayer]);

  const playerToDisplay = isDemoMode ? localPlayerData : selectedPlayer;

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''} ${isDemoMode ? 'demo-mode' : ''}`}>
      <Toaster position="top-right" />
      <button className="close-btn" onClick={onClose}><X size={24} /></button>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Player Details</h2>
          {isDemoMode && <span className="demo-mode-indicator">Demo Mode</span>}
        </div>
        <div className="player-header">
          <div className="player-rank">#{playerRank}</div>
          <h2 className="sidebar-player-name">{playerToDisplay ? playerToDisplay["Player Name"] : "Player Name"}</h2>
          <div className="player-tier">{playerTier === "Got Next Tier" ? "NXT ⬆️" : playerTier}</div>
        </div>
        {playerToDisplay && (
          <div className="goat-points-container">
            <h2>G.O.A.T Points {isDemoMode && <span className="demo-mode-indicator">(Demo)</span>}</h2>
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
          <CategoryButton icon={CheckCircle} name="Completed" onClick={() => setSelectedCategory('Completed')} />
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
          <h3>Achievements - {selectedCategory} {isDemoMode && <span className="demo-mode-indicator">(Demo)</span>}</h3>
          {memoizedAchievements || <p className="no-achievements">No achievements found for this player.</p>}
        </div>
      </div>
    </div>
  );
});

export default Sidebar;