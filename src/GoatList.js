import React, { useMemo } from 'react';
import playersData from './players.json';
import { User } from 'lucide-react';

const PlayerIcon = ({ player, rank }) => (
  <div className="player-icon">
    {player.image ? (
      <img src={player.image} alt={player["Player Name"]} width={60} height={60} />
    ) : (
      <User size={60} />
    )}
    <div className="rank">{rank}</div>
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
  const rankedAndTieredPlayers = useMemo(() => {
    const sorted = [...playersData.players].sort((a, b) => b["Total GOAT Points"] - a["Total GOAT Points"]);
    return sorted.map((player, index) => ({
      ...player,
      rank: index + 1,
      Tier: determineTier(player["Total GOAT Points"])
    }));
  }, []);

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
      <h1>Logan Bradley's GOAT List</h1>
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
        <h2>Logan Bradley's Got Next Tier</h2>
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