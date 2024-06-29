import React from 'react';
import { User } from 'lucide-react';

const PlayerIcon = ({ rank }) => (
  <div className="player-icon">
    <User size={40} />
    <div className="rank">{rank}</div>
  </div>
);

const Tier = ({ tier, players }) => (
  <div className={`tier tier-${tier}`}>
    <div className="tier-label">{tier}</div>
    <div className="players">
      {players.map((rank) => (
        <PlayerIcon key={rank} rank={rank} />
      ))}
    </div>
  </div>
);

const GoatList = () => {
  const tiers = [
    { tier: 1, players: [1, 2, 3] },
    { tier: 2, players: [4, 5, 6, 7, 8, 9, 10] },
    { tier: 3, players: [11, 12, 13, 14, 15, 16, 17] },
    { tier: 4, players: [18, 19, 20, 21, 22, 23, 24] },
    { tier: 5, players: [25, 26, 27, 28, 29, 30, 31] },
  ];

  return (
    <div className="goat-list">
      <h1>Logan Bradley's GOAT List</h1>
      {tiers.map(({ tier, players }) => (
        <Tier key={tier} tier={tier} players={players} />
      ))}
      <div className="next-tier">
        <h2>Logan Bradley's Got Next Tier</h2>
        <div className="players">
          {[1, 2, 3, 4, 5].map((i) => (
            <PlayerIcon key={i} rank="" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GoatList