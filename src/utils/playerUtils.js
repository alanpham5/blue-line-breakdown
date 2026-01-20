export const playerUtils = {
  getPlayerHeadshot(playerId, team = null, season = null) {
    if (team && season) {
      const seasonYear = parseInt(season);
      const nextYear = seasonYear + 1;
      const yearRange = `${seasonYear}${nextYear}`;
      const teamCode =
        team.toUpperCase() == "ARI" && seasonYear <= 2013
          ? "PHX"
          : team.toUpperCase();

      return `https://assets.nhle.com/mugs/nhl/${yearRange}/${teamCode}/${playerId}.png`;
    }
    return `https://assets.nhle.com/mugs/nhl/latest/${playerId}.png`;
  },

  getDefaultHeadshot() {
    return "https://assets.nhle.com/mugs/nhl/default-skater.png";
  },

  getFullTeamName(teamCode, season = null) {
    if (teamCode.toUpperCase() === "ARI" && season <= 2013) {
      return "Phoenix Coyotes";
    }
    if (teamCode.toUpperCase() === "UTA" && season < 2025) {
      return "Utah Hockey Club";
    }
    const teamNames = {
      ANA: "Anaheim Ducks",
      ARI: "Arizona Coyotes",
      ATL: "Atlanta Thrashers",
      BOS: "Boston Bruins",
      BUF: "Buffalo Sabres",
      CGY: "Calgary Flames",
      CAR: "Carolina Hurricanes",
      COL: "Colorado Avalanche",
      CBJ: "Columbus Blue Jackets",
      DAL: "Dallas Stars",
      DET: "Detroit Red Wings",
      EDM: "Edmonton Oilers",
      FLA: "Florida Panthers",
      LAK: "Los Angeles Kings",
      MIN: "Minnesota Wild",
      MTL: "Montreal Canadiens",
      NJD: "New Jersey Devils",
      NSH: "Nashville Predators",
      NYI: "New York Islanders",
      NYR: "New York Rangers",
      OTT: "Ottawa Senators",
      PHI: "Philadelphia Flyers",
      PIT: "Pittsburgh Penguins",
      SEA: "Seattle Kraken",
      SJS: "San Jose Sharks",
      STL: "St. Louis Blues",
      TBL: "Tampa Bay Lightning",
      TOR: "Toronto Maple Leafs",
      UTA: "Utah Mammoth",
      VAN: "Vancouver Canucks",
      VGK: "Vegas Golden Knights",
      WSH: "Washington Capitals",
      WPG: "Winnipeg Jets",
    };

    return teamNames[teamCode.toUpperCase()] || teamCode.toUpperCase();
  },

  getTeamLogoUrl(teamCode, season = null) {
    if (!teamCode) return null;

    const teamCodeUpper = teamCode.toUpperCase();

    if (teamCodeUpper === "WSH") {
      return "https://assets.nhle.com/logos/nhl/svg/WSH_secondary_dark.svg";
    }

    if (!season) {
      if (teamCodeUpper === "ATL") {
        return "https://assets.nhle.com/logos/nhl/svg/ATL_19992000-20102011_dark.svg";
      }
      if (teamCodeUpper === "PHX") {
        return "https://assets.nhle.com/logos/nhl/svg/PHX_20032004-20132014_dark.svg";
      }
      return `https://assets.nhle.com/logos/nhl/svg/${teamCodeUpper}_dark.svg`;
    }

    const seasonYear = parseInt(season);

    const logoEras = {
      ATL: [{ start: 1999, end: 2010, url: "ATL_19992000-20102011_dark.svg" }],
      ARI: [{ start: 2003, end: 2020, url: "PHX_20032004-20132014_dark.svg" }],
      BUF: [
        { start: 2006, end: 2009, url: "BUF_20062007-20092010_dark.svg" },
        { start: 2010, end: 2019, url: "BUF_20102011-20192020_dark.svg" },
      ],
      OTT: [{ start: 2007, end: 2019, url: "OTT_20072008-20192020_dark.svg" }],
      NYI: [{ start: 2008, end: 2009, url: "NYI_19971998-20092010_dark.svg" }],
      TBL: [{ start: 2008, end: 2010, url: "TBL_20072008-20102011_dark.svg" }],
      NSH: [{ start: 1998, end: 2010, url: "NSH_19981999-20102011_dark.svg" }],
      ANA: [{ start: 2006, end: 2023, url: "ANA_20132014-20232024_dark.svg" }],
      DAL: [{ start: 1994, end: 2012, url: "DAL_19941995-20122013_dark.svg" }],
      FLA: [{ start: 1999, end: 2015, url: "FLA_19992000-20152016_dark.svg" }],
      PIT: [{ start: 2006, end: 2015, url: "PIT_20062007-20152016_dark.svg" }],
      LAK: [
        { start: 2002, end: 2009, url: "LAK_20022003-20092010_dark.svg" },
        { start: 2010, end: 2010, url: "LAK_20102011_dark.svg" },
        { start: 2011, end: 2018, url: "LAK_20112012-20182019_dark.svg" },
        { start: 2019, end: 2024, url: "LAK_20192020-20232024_dark.svg" },
      ],
      BOS: [{ start: 2008, end: 2024, url: "BOS_20082009-20222023_dark.svg" }],
      TOR: [{ start: 1987, end: 2015, url: "TOR_19871988-20152016_dark.svg" }],
      STL: [{ start: 2008, end: 2024, url: "STL_20082009-20242025_light.svg" }],
      UTA: [{ start: 2024, end: 2024, url: "UTA_20242025-20242025_dark.svg" }],
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
      // Offensive metrics
      SHOT_TAL: "Shooting Talent",
      PLAY_DRV: "Play Driving",
      SHOT_FREQ: "Shooting Tendency",
      PASS_FREQ: "Passing Tendency",
      PP_USAGE: "Power Play Usage",
      ONICE_IMP: "On-Ice Impact",

      // Defensive metrics
      POS_CTRL: "Possession Control",
      BLK: "Shot Blocking",
      HIT: "Physical Engagement",
      TAKE: "Takeaways",
      CH_SUP: "Chance Suppression",
      GOAL_PREV: "Goal Prevention",
    };
    return statNames[statKey] || statKey;
  },

  getStatExplanation(statKey) {
    const explanations = {
      // Offensive metrics
      SHOT_TAL:
        "How well the player shoots and turns scoring chances into goals.",
      PLAY_DRV: "How often the player creates scoring chances for teammates.",
      SHOT_FREQ: "How often the player chooses to shoot the puck.",
      PASS_FREQ: "How often the player chooses to pass the puck.",
      PP_USAGE: "How often the player is utilized on the power play.",
      ONICE_IMP:
        "How much offense the team creates when the player is on the ice.",

      // Defensive metrics
      POS_CTRL:
        "How well the team controls possession with the player on the ice.",
      BLK: "How often the player blocks opponent shots.",
      HIT: "How often the player uses physical contact (hits, scrums, or fights) to disrupt opponents.",
      TAKE: "How often the player takes the puck away from opponents.",
      CH_SUP: "Share of opponent scoring chances limited by the player.",
      GOAL_PREV: "Share of scoring attempts stopped by the player.",
      // Other metrics
      winShare:
        "The percentile rank of the player's contribution to team wins compared to other players on the team in the same position.",
    };

    return (
      explanations[statKey] ||
      "Player performance metric compared to league average."
    );
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
      "I_F_goals",
      "I_F_xGoals",
      "I_F_primaryAssists",
      "I_F_points",
      "OnIce_F_xGoals",
      "I_F_giveaways",
    ];

    return statKeys
      .map((key) => {
        let value = stats[key];
        if (value === undefined && allPercentiles) {
          if (
            allPercentiles.offensive &&
            allPercentiles.offensive[key] !== undefined
          ) {
            value = allPercentiles.offensive[key];
          } else if (
            allPercentiles.defensive &&
            allPercentiles.defensive[key] !== undefined
          ) {
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
      .filter((stat) => stat !== null);
  },
};
