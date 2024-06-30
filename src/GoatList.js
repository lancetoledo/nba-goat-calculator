import React, { useState, useEffect, useMemo } from 'react';
import playersData from './players.json';
import { User } from 'lucide-react';

const PlayerIcon = ({ player, rank }) => (
    <div className="player-icon">
      {player.imageUrl ? (
        <img src={player.imageUrl} alt={player["Player Name"]} width={80} height={80} />
      ) : (
        <User size={80} />
      )}
      <div className="rank">{rank}</div>
      <div className="player-name">{player["Player Name"]}</div>
    </div>
  );

const Tier = ({ tier, players }) => (
  <div className={`tier tier-${tier}`}>
    <div className="tier-label">{tier}</div>
    <div className="players">
      {players.map((player) => (
        <PlayerIcon key={player["Player Name"]} player={player} rank={player.rank} />
      ))}
    </div>
  </div>
);

const determineTier = (points) => {
  if (points >= 6500000) return "Tier 1";
  if (points >= 5100000) return "Tier 2";
  if (points >= 3700000) return "Tier 3";
  if (points >= 2300000) return "Tier 4";
  if (points >= 900000) return "Tier 5";
  return "Got Next Tier";
};

const GoatList = () => {
  const [players, setPlayers] = useState(playersData.players.map(player => ({
    ...player,
    imageUrl: player.image || null
  })));
  const theSportsDBApiKey = '3'; // Replace with your actual API key if needed

//   useEffect(() => {
//     const fetchPlayerImages = async () => {
//       const updatedPlayers = await Promise.all(players.map(async (player) => {
//         // Skip API call for Jerry West, Isiah Thomas, and Michael Jordan
//         if (player["Player Name"] === "Jerry West" || player["Player Name"] === "Isiah Thomas" || player["Player Name"] === "Michael Jordan") {
//           console.log(`${player["Player Name"]}: Using hardcoded image - ${player.imageUrl}`);
//           return player;
//         }

//         try {
//           const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${theSportsDBApiKey}/searchplayers.php?p=${encodeURIComponent(player["Player Name"])}`);
//           const data = await response.json();
//           if (data.player && data.player.length > 0 && data.player[0].strCutout) {
//             console.log(`${player["Player Name"]}: Updated with API image - ${data.player[0].strCutout}`);
//             return { ...player, imageUrl: data.player[0].strCutout };
//           } else {
//             console.log(`${player["Player Name"]}: No image found in API response, keeping default`);
//             return player;
//           }
//         } catch (error) {
//           console.error(`Error fetching data for ${player["Player Name"]}:`, error);
//           console.log(`${player["Player Name"]}: Keeping default image due to API error`);
//           return player;
//         }
//       }));
//       setPlayers(updatedPlayers);
//     };

//     fetchPlayerImages();
//   }, []);

  const rankedAndTieredPlayers = useMemo(() => {
    const sorted = [...players].sort((a, b) => b["Total GOAT Points"] - a["Total GOAT Points"]);
    return sorted.map((player, index) => ({
      ...player,
      rank: index + 1,
      Tier: determineTier(player["Total GOAT Points"])
    }));
  }, [players]);

  const tiers = useMemo(() => {
    const tiersObj = {
      "Tier 1": [],
      "Tier 2": [],
      "Tier 3": [],
      "Tier 4": [],
      "Tier 5": [],
      "Got Next Tier": []
    };

    rankedAndTieredPlayers.forEach(player => {
      tiersObj[player.Tier].push(player);
    });

    return tiersObj;
  }, [rankedAndTieredPlayers]);

  return (
    <div className="goat-list">
      <h1>SQUADRON's GOAT List</h1>
      {Object.entries(tiers).map(([tier, players]) => 
        tier !== "Got Next Tier" ? (
          <Tier 
            key={tier} 
            tier={tier.split(' ')[1]} 
            players={players} 
          />
        ) : null
      )}
      <div className="next-tier">
        <h2>SQUADRON's Got Next Tier</h2>
        <div className="players">
          {tiers["Got Next Tier"].map((player) => (
            <PlayerIcon key={player["Player Name"]} player={player} rank={player.rank} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoatList;