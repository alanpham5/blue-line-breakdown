export const playerUtils = {
  getPlayerHeadshot(playerId) {
    return `https://assets.nhle.com/mugs/nhl/latest/${playerId}.png`;
  },

  getDefaultHeadshot() {
    return "https://assets.nhle.com/mugs/nhl/default-skater.png";
  },

  formatSeason(year) {
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) return year;
    const nextYear = yearNum + 1;
    return `${yearNum}-${nextYear}`;
  },

  formatStatName(statKey) {
    const statNames = {
      I_F_goals: "Goals",
      I_F_primaryAssists: "Primary Assists",
      I_F_secondaryAssists: "Secondary Assists",
      I_F_points: "Points",
      I_F_shotsOnGoal: "Shots on Goal",
      I_F_shotAttempts: "Shot Attempts",
      I_F_xGoals: "Expected Goals",
      I_F_hits: "Hits",
      I_F_takeaways: "Takeaways",
      I_F_giveaways: "Giveaways",
      shotsBlockedByPlayer: "Shots Blocked",
      OnIce_F_xGoals: "On-Ice Expected Goals %",
      OnIce_F_goals: "On-Ice Goals For",
      OnIce_A_xGoals: "On-Ice xG Against",
      OnIce_A_goals: "On-Ice Goals Against",
      onIce_corsiPercentage: "Corsi Percentage",
    };
    return statNames[statKey] || statKey;
  },

  getTopStats(stats, count = 6) {
    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([key, value]) => ({
        name: this.formatStatName(key),
        value,
      }));
  },

  getOffensiveStats(stats, allPercentiles = null) {
    const statKeys = [
      'I_F_goals',
      'I_F_xGoals',
      'I_F_primaryAssists',
      'I_F_points',
      'I_F_giveaways',
      'OnIce_F_xGoals'
    ];

    return statKeys
      .map(key => {
        let value = stats[key];
        if (value === undefined && allPercentiles) {
          if (allPercentiles.offensive && allPercentiles.offensive[key] !== undefined) {
            value = allPercentiles.offensive[key];
          } else if (allPercentiles.defensive && allPercentiles.defensive[key] !== undefined) {
            value = allPercentiles.defensive[key];
          } else if (allPercentiles[key] !== undefined) {
            value = allPercentiles[key];
          }
        }
        
        if (value !== undefined) {
          return {
            name: this.formatStatName(key),
            value: value,
          };
        }
        return null;
      })
      .filter(stat => stat !== null);
  },
};
