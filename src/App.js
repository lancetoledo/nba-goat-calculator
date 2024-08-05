import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, addDoc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, rtdb } from './firebase';
import GoatList from './GoatList';
import Sidebar from './Sidebar';
import PlayerInputSidebar from './PlayerInputSidebar';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlayerInputSidebarOpen, setIsPlayerInputSidebarOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [criteria, setCriteria] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'players'), orderBy('Total GOAT Points', 'desc'));
    const unsubscribePlayers = onSnapshot(q, (snapshot) => {
      const playersData = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        rank: index + 1
      }));
      
      setPlayers(prevPlayers => {
        if (JSON.stringify(playersData) !== JSON.stringify(prevPlayers)) {
          return playersData;
        }
        return prevPlayers;
      });
      
      setSelectedPlayer(prevSelected => {
        if (prevSelected) {
          const updatedSelectedPlayer = playersData.find(p => p.id === prevSelected.id);
          if (updatedSelectedPlayer && JSON.stringify(updatedSelectedPlayer) !== JSON.stringify(prevSelected)) {
            return updatedSelectedPlayer;
          }
        }
        return prevSelected;
      });
    });

    const criteriaRef = ref(rtdb, 'criteria');
    const unsubscribeCriteria = onValue(criteriaRef, (snapshot) => {
      if (snapshot.exists()) {
        const newCriteria = snapshot.val();
        setCriteria(prevCriteria => {
          if (JSON.stringify(newCriteria) !== JSON.stringify(prevCriteria)) {
            return newCriteria;
          }
          return prevCriteria;
        });
      } else {
        console.log("No criteria data available");
      }
    }, { onlyOnce: true });
    
    return () => {
      unsubscribePlayers();
      unsubscribeCriteria();
    };
  }, []);

  const updatePlayer = useCallback(async (updatedPlayer) => {
    try {
      await setDoc(doc(db, 'players', updatedPlayer.id), updatedPlayer, { merge: true });
    } catch (error) {
      console.error('Error updating player:', error);
    }
  }, []);

  const addPlayer = useCallback(async (newPlayer) => {
    try {
      await addDoc(collection(db, 'players'), newPlayer);
    } catch (error) {
      console.error('Error adding player:', error);
    }
  }, []);

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

  const memoizedPlayers = useMemo(() => players, [players]);
  const memoizedCriteria = useMemo(() => criteria, [criteria]);

  return (
    <div className={`App ${isSidebarOpen ? 'sidebar-open' : ''} ${isPlayerInputSidebarOpen ? 'player-input-sidebar-open' : ''}`}>
      <GoatList 
        isSidebarOpen={isSidebarOpen}
        isPlayerInputSidebarOpen={isPlayerInputSidebarOpen}
        toggleSidebar={toggleSidebar}
        togglePlayerInputSidebar={togglePlayerInputSidebar}
        onPlayerClick={handlePlayerClick}
        selectedPlayer={selectedPlayer}
        players={memoizedPlayers}
      />
      <Sidebar 
        isOpen={isSidebarOpen} 
        selectedPlayer={selectedPlayer} 
        onClose={toggleSidebar}
        onUpdatePlayer={updatePlayer}
        allPlayers={memoizedPlayers}
        criteria={memoizedCriteria}
      />
      <PlayerInputSidebar
        isOpen={isPlayerInputSidebarOpen}
        onClose={togglePlayerInputSidebar}
        onAddPlayer={addPlayer}
        players={memoizedPlayers}
        criteria={memoizedCriteria}
      />
    </div>
  );
}

export default App;