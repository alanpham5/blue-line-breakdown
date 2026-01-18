export const playerUtils = {
  getPlayerHeadshot(playerId, team = null, season = null) {
    if (team && season) {
      const seasonYear = parseInt(season);
      const nextYear = seasonYear + 1;
      const yearRange = `${seasonYear}${nextYear}`;
      const teamCode = team.toUpperCase();
      return `https://assets.nhle.com/mugs/nhl/${yearRange}/${teamCode}/${playerId}.png`;
    }
    return `https://assets.nhle.com/mugs/nhl/latest/${playerId}.png`;
  },

  getDefaultHeadshot() {
    return "https://assets.nhle.com/mugs/nhl/default-skater.png";
  },

  getTeamLogoUrl(teamCode, season = null) {
    if (!teamCode) return null;

    const teamCodeUpper = teamCode.toUpperCase();

    if (!season) {
      if (teamCodeUpper === 'ATL') {
        return 'https://assets.nhle.com/logos/nhl/svg/ATL_19992000-20102011_dark.svg';
      }
      if (teamCodeUpper === 'PHX') {
        return 'https://assets.nhle.com/logos/nhl/svg/PHX_20032004-20132014_dark.svg';
      }
      return `https://assets.nhle.com/logos/nhl/svg/${teamCodeUpper}_dark.svg`;
    }

    const seasonYear = parseInt(season);

    const logoEras = {
      'ATL': [
        { start: 1999, end: 2010, url: 'ATL_19992000-20102011_dark.svg' }
      ],
      'PHX': [  
        { start: 2003, end: 13, url: 'PHX_20032004-20132014_dark.svg' }
      ],
      'ARI': [  
        { start: 2003, end: 2020, url: 'PHX_20032004-20132014_dark.svg' }
      ],
      'BUF': [
        { start: 2006, end: 2009, url: 'BUF_20062007-20092010_dark.svg' }
      ],
      'OTT': [
        { start: 2007, end: 2019, url: 'OTT_20072008-20192020_dark.svg' }
      ],
      'NYI': [
        { start: 2008, end: 2009, url: 'NYI_20072008-20092010_dark.svg' }
      ],
      'TBL': [
        { start: 2008, end: 2010, url: 'TBL_20072008-20102011_dark.svg' }
      ],
      'NSH': [
        { start: 1998, end: 2010, url: 'NSH_19981999-20102011_dark.svg' }
      ],
      'ANA': [
        { start: 2006, end: 2012, url: 'ANA_20062007-20122013_dark.svg' },
        { start: 2013, end: 2023, url: 'ANA_20132014-20232024_dark.svg' },

      ],
      'DAL': [
        {start: 1994, end: 2012, url:'DAL_19941995-20122013_dark.svg'}
      ],
      'FLA': [
        { start: 1999, end: 2015, url: 'FLA_19992000-20152016_dark.svg' }
      ],
      'PIT': [
        { start: 2006, end: 2015, url: 'PIT_20062007-20152016_dark.svg' }
      ],
      'LAK': [
        { start: 2002, end: 2009, url: 'LAK_20022003-20092010_dark.svg' },
        { start: 2010, end: 2010, url: 'LAK_20102011_dark.svg' },
        { start: 2011, end: 2018, url: 'LAK_20112012-20182019_dark.svg' },
        { start: 2019, end: 2024, url: 'LAK_20202021-20232024_dark.svg' },
      ],
      'BOS': [
        { start: 2008, end: 2024, url: 'BOS_20082009-20222023_dark.svg' }  
      ],
      'TOR': [
        { start: 1987, end: 2015, url: 'TOR_19871988-20152016_dark.svg' }
      ]
    };

    if (logoEras[teamCodeUpper]) {
      for (const era of logoEras[teamCodeUpper]) {
        if (seasonYear >= era.start && seasonYear <= era.end) {
          return `https://assets.nhle.com/logos/nhl/svg/${era.url}`;
        }
      }
    }

    return `https://assets.nhle.com/logos/nhl/svg/${teamCodeUpper}_dark.svg`;
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

  isInvertedStat(statKey) {
    const invertedStats = [
      'I_F_giveaways',
      'OnIce_A_xGoals',
      'OnIce_A_goals',
    ];
    return invertedStats.includes(statKey);
  },

  getTopStats(stats, count = 6) {
    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([key, value]) => ({
        key,
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
      'OnIce_F_xGoals',
      'I_F_giveaways'
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
            key,
            name: this.formatStatName(key),
            value: value,
          };
        }
        return null;
      })
      .filter(stat => stat !== null);
  },
};
