import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from './firebase';
import GoatList from './GoatList';
import Sidebar from './Sidebar';
import PlayerInputSidebar from './PlayerInputSidebar';
import './App.css';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

console.log(useState)
function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlayerInputSidebarOpen, setIsPlayerInputSidebarOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [criteria, setCriteria] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoPlayers, setDemoPlayers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('Total GOAT Points', 'desc'));
    const unsubscribePlayers = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        rank: index + 1
      }));
      
      setPlayers(playersData);
      
      setSelectedPlayer(prevSelected => {
        if (prevSelected) {
          const updatedSelectedPlayer = playersData.find(p => p.id === prevSelected.id);
          return updatedSelectedPlayer || null;
        }
        return prevSelected;
      });
    });

    const criteriaRef = ref(rtdb, 'criteria');
    const unsubscribeCriteria = onValue(criteriaRef, (snapshot) => {
      if (snapshot.exists()) {
        setCriteria(snapshot.val());
      } else {
        console.log("No criteria data available");
      }
    });
    
    return () => {
      unsubscribePlayers();
      unsubscribeCriteria();
    };
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setDemoPlayers(JSON.parse(JSON.stringify(players)));
    }
  }, [isDemoMode, players]);

  const updatePlayer = useCallback(async (updatedPlayer) => {
    if (isDemoMode) {
      setDemoPlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === updatedPlayer.id ? updatedPlayer : player
        )
      );
    } else {
      try {
        await setDoc(doc(db, 'players', updatedPlayer.id), updatedPlayer, { merge: true });
      } catch (error) {
        console.error('Error updating player:', error);
      }
    }
  }, [isDemoMode]);

  const addPlayer = useCallback(async (newPlayer) => {
    if (isDemoMode) {
      setDemoPlayers(prevPlayers => [...prevPlayers, { ...newPlayer, id: Date.now().toString() }]);
    } else {
      try {
        await addDoc(collection(db, 'players'), newPlayer);
      } catch (error) {
        console.error('Error adding player:', error);
      }
    }
  }, [isDemoMode]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
    setIsPlayerInputSidebarOpen(false);
  }, []);

  const togglePlayerInputSidebar = useCallback(() => {
    setIsPlayerInputSidebarOpen(prev => !prev);
    setIsSidebarOpen(false);
  }, []);

  const handlePlayerClick = useCallback((player) => {
    setSelectedPlayer(player);
    setIsSidebarOpen(true);
    setIsPlayerInputSidebarOpen(false);
  }, []);

  const prevModeRef = useRef(false);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode(prev => {
      const newMode = !prev;
      if (newMode !== prevModeRef.current) {
        prevModeRef.current = newMode;
        if (newMode) {
          toast.success('Demo Mode activated', {
            icon: '🎮',
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          });
        } else {
          toast.success('Real Mode activated', {
            icon: '🏀',
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          });
        }
      }
      return newMode;
    });
    // Reset selected player when toggling demo mode
    setSelectedPlayer(null);
    setIsSidebarOpen(false);
  }, []);
  
  const memoizedPlayers = useMemo(() => isDemoMode ? demoPlayers : players, [isDemoMode, demoPlayers, players]);

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''} ${isPlayerInputSidebarOpen ? 'player-input-sidebar-open' : ''}`}>
      <Toaster position="top-center" /> {/* Add this line */}
      <div className="demo-mode-toggle">
        <button onClick={toggleDemoMode} className="demo-toggle-btn">
          {isDemoMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          <span>{isDemoMode ? 'Demo Mode' : 'Real Mode'}</span>
        </button>
      </div>
      <GoatList 
        isSidebarOpen={isSidebarOpen}
        isPlayerInputSidebarOpen={isPlayerInputSidebarOpen}
        toggleSidebar={toggleSidebar}
        togglePlayerInputSidebar={togglePlayerInputSidebar}
        onPlayerClick={handlePlayerClick}
        selectedPlayer={selectedPlayer}
        players={memoizedPlayers}
      />
      {criteria && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          selectedPlayer={selectedPlayer} 
          onClose={toggleSidebar}
          onUpdatePlayer={updatePlayer}
          allPlayers={memoizedPlayers}
          criteria={criteria}
          isDemoMode={isDemoMode}
        />
      )}
      <PlayerInputSidebar
        isOpen={isPlayerInputSidebarOpen}
        onClose={togglePlayerInputSidebar}
        onAddPlayer={addPlayer}
        players={memoizedPlayers}
        criteria={criteria}
        isDemoMode={isDemoMode}
      />
    </div>
  );
}

export default App;