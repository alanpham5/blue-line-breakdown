import { stanleyCupChampions } from "../data/stanleyCupData";

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

  getTeamColor(teamCode, season = null, actualTheme = "dark") {
    const retroColors = {
      NSH: [
        {
          start: 1998,
          end: 2010,
          primary: "#041E42",
          secondary: "#AFB7BA",
          worksOnDark: false,
        },
      ],
      BUF: [
        {
          start: 2006,
          end: 2019,
          primary: "#041E42",
          secondary: "#FFB81C",
          worksOnDark: false,
        },
      ],
      LAK: [
        {
          start: 1998,
          end: 2010,
          primary: "#250E62",
          secondary: "#A2AAAD",
          worksOnDark: false,
        },
      ],
      ANA: [
        {
          start: 2006,
          end: 2012,
          primary: "#000000",
          secondary: "#B5985A",
          worksOnDark: false,
        },
        {
          start: 2013,
          end: 2023,
          primary: "#000000",
          secondary: "#FC4C02",
          worksOnDark: false,
        },
      ],
      NYR: [
        {
          start: 2025,
          end: 2025,
          primary: "#0072CE",
          secondary: "#CE1126",
          worksOnDark: true,
        },
      ],
      DAL: [
        {
          start: 1994,
          end: 2012,
          primary: "#000000",
          secondary: "#C69214",
          worksOnDark: false,
        },
      ],
      PIT: [
        {
          start: 2006,
          end: 2015,
          primary: "#000000",
          secondary: "#C5B358",
          worksOnDark: false,
        },
      ],
      EDM: [
        {
          start: 1996,
          end: 2010,
          primary: "#041E42",
          secondary: "#AD7C59",
          worksOnDark: false,
        },
        {
          start: 2017,
          end: 2021,
          primary: "#FC4C02",
          secondary: "#041E42",
          worksOnDark: true,
        },
      ],
      FLA: [
        {
          start: 2003,
          end: 2010,
          primary: "#041E42",
          secondary: "#C8102E",
          worksOnDark: false,
        },
      ],
      STL: [
        {
          start: 1995,
          end: 2024,
          primary: "#002F87",
          secondary: "#FCB514",
          worksOnDark: false,
        },
      ],
      NYI: [
        {
          start: 1995,
          end: 2009,
          primary: "#041E42",
          secondary: "#FC4C02",
          worksOnDark: false,
        },
      ],
    };

    const teamBrand = {
      ANA: { primary: "#CF4520", secondary: "#000000", worksOnDark: true },
      ARI: { primary: "#6F263D", secondary: "#862633", worksOnDark: false },
      ATL: { primary: "#041E42", secondary: "#5C88DA", worksOnDark: false },
      BOS: { primary: "#000000", secondary: "#FFB81C", worksOnDark: false },
      BUF: { primary: "#003087", secondary: "#FFB81C", worksOnDark: false },
      CGY: { primary: "#C8102E", secondary: "#F1BE48", worksOnDark: true },
      CHI: { primary: "#CF0A2C", secondary: "#000000", worksOnDark: true },
      CAR: { primary: "#CC0000", secondary: "#000000", worksOnDark: true },
      COL: { primary: "#6F263D", secondary: "#236192", worksOnDark: true },
      CBJ: { primary: "#002654", secondary: "#CE1126", worksOnDark: false },
      DAL: { primary: "#006847", secondary: "#8F8F8C", worksOnDark: true },
      DET: { primary: "#CE1126", secondary: "#FFFFFF", worksOnDark: true },
      EDM: { primary: "#00205B", secondary: "#FF4C00", worksOnDark: false },
      FLA: { primary: "#C8102E", secondary: "#041E42", worksOnDark: true },
      LAK: { primary: "#000000", secondary: "#AFB7BA", worksOnDark: false },
      MIN: { primary: "#154734", secondary: "#A6192E", worksOnDark: false },
      MTL: { primary: "#AF1E2D", secondary: "#192168", worksOnDark: true },
      NJD: { primary: "#CE1126", secondary: "#000000", worksOnDark: true },
      NSH: { primary: "#efad1c", secondary: "#041E42", worksOnDark: true },
      NYI: { primary: "#003087", secondary: "#FC4C02", worksOnDark: false },
      NYR: { primary: "#0038A8", secondary: "#CE1126", worksOnDark: false },
      OTT: { primary: "#C52032", secondary: "#D69F0F", worksOnDark: true },
      PHI: { primary: "#F74902", secondary: "#000000", worksOnDark: true },
      PIT: { primary: "#000000", secondary: "#ffb71cee", worksOnDark: false },
      SEA: { primary: "#68A2B9", secondary: "#001628", worksOnDark: true },
      SJS: { primary: "#006D75", secondary: "#000000", worksOnDark: true },
      STL: { primary: "#0072CE", secondary: "#FCB514", worksOnDark: false },
      TBL: { primary: "#002868", secondary: "#002c7e", worksOnDark: false },
      TOR: { primary: "#00205B", secondary: "#002c7e", worksOnDark: false },
      UTA: { primary: "#6CACE3", secondary: "#000000", worksOnDark: true },
      VAN: { primary: "#00205B", secondary: "#00843D", worksOnDark: false },
      VGK: { primary: "#B4975A", secondary: "#333F42", worksOnDark: true },
      WSH: { primary: "#C8102E", secondary: "#041E42", worksOnDark: true },
      WPG: { primary: "#041E42", secondary: "#0363C2", worksOnDark: false },
    };

    let brand = teamBrand[teamCode];

    // --- Retro override (keeps full brand shape) ---
    if (retroColors[teamCode] && season) {
      const seasonYear = parseInt(season);
      for (const era of retroColors[teamCode]) {
        if (seasonYear >= era.start && seasonYear <= era.end) {
          brand = {
            ...brand,
            ...era, // override primary/secondary/worksOnDark
          };
          break;
        }
      }
    }

    if (!brand) return "#AFB7BA";

    // Light mode → always primary
    if (actualTheme === "light") {
      return brand.primary;
    }

    // Dark mode → keep primary if it works
    if (brand.worksOnDark) {
      return brand.primary;
    }

    // Otherwise use secondary if usable
    if (
      brand.secondary &&
      brand.secondary !== "#FFFFFF" &&
      brand.secondary !== "#000000"
    ) {
      return brand.secondary;
    }

    // Mono fallback
    return brand.primary;
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
      CHI: "Chicago Blackhawks",
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

  getTeamLogoUrl(teamCode, season = null, actualTheme = "dark") {
    if (!teamCode) return null;

    const suffix = actualTheme === "light" ? "light" : "dark";

    const applySuffix = (path) =>
      path.replace(/_(?:dark)\.svg$/i, `_${suffix}.svg`);

    const base = "https://assets.nhle.com/logos/nhl/svg";
    const teamCodeUpper = teamCode.toUpperCase();

    if (teamCodeUpper === "WSH") {
      return `${base}/${applySuffix("WSH_secondary_dark.svg")}`;
    }

    if (!season) {
      if (teamCodeUpper === "ATL") {
        return `${base}/${applySuffix("ATL_19992000-20102011_dark.svg")}`;
      }
      if (teamCodeUpper === "PHX") {
        return `${base}/${applySuffix("PHX_20032004-20132014_dark.svg")}`;
      }
      return `${base}/${teamCodeUpper}_${suffix}.svg`;
    }

    const seasonYear = parseInt(season);

    if (teamCodeUpper === "TOR" && seasonYear == 2016) {
      return "/leafs-100.svg";
    }
    if (teamCodeUpper === "MTL" && (seasonYear == 2008 || seasonYear == 2009)) {
      return "/canadiens-100-1.svg";
    }
    if (teamCodeUpper === "BOS" && seasonYear == 2023) {
      return "/bruins-100.svg";
    }
    if (seasonYear === 2025) {
      if (teamCodeUpper === "NYR") return "/rangers-100.svg";
      else if (teamCodeUpper === "DET") return "/redwings-100.svg";
      else if (teamCodeUpper === "CHI")
        return actualTheme == "dark"
          ? "/blackhawks-100-dark.svg"
          : "/blackhawks-100.svg";
    }
    if (teamCodeUpper === "NSH" && seasonYear >= 1998 && seasonYear <= 2010) {
      return actualTheme === "dark"
        ? `${base}/NSH_19981999-20102011_light.svg`
        : `${base}/NSH_19981999-20102011_dark.svg`;
    }

    const logoEras = {
      ATL: [{ start: 1999, end: 2010, url: "ATL_19992000-20102011_dark.svg" }],
      ARI: [{ start: 2003, end: 2020, url: "PHX_20032004-20132014_dark.svg" }],
      BUF: [
        { start: 2006, end: 2009, url: "BUF_20062007-20092010_dark.svg" },
        { start: 2010, end: 2019, url: "BUF_20102011-20192020_dark.svg" },
      ],
      CGY: [{ start: 1994, end: 2019, url: "CGY_19941995-20192020_dark.svg" }],
      CHI: [{ start: 2025, end: 2025, url: "CHI_19651966-19881989_dark.svg" }],
      DET: [{ start: 2025, end: 2025, url: "DET_19321933-19471948_dark.svg" }],
      EDM: [
        { start: 1996, end: 2010, url: "EDM_19971998-20102011_dark.svg" },
        { start: 2017, end: 2021, url: "EDM_20172018-20212022_dark.svg" },
      ],
      NYI: [{ start: 1997, end: 2009, url: "NYI_19971998-20092010_dark.svg" }],
      OTT: [{ start: 2007, end: 2019, url: "OTT_20072008-20192020_dark.svg" }],
      TBL: [{ start: 2008, end: 2010, url: "TBL_20072008-20102011_dark.svg" }],
      ANA: [{ start: 2006, end: 2023, url: "ANA_20132014-20232024_dark.svg" }],
      DAL: [{ start: 1994, end: 2012, url: "DAL_19941995-20122013_dark.svg" }],
      FLA: [{ start: 1999, end: 2015, url: "FLA_19992000-20152016_dark.svg" }],
      MTL: [{ start: 2009, end: 2010, url: "MTL_19171918-19181919_dark.svg" }],
      NYR: [{ start: 2025, end: 2025, url: "NYR_19261927-19341935_dark.svg" }],
      PIT: [{ start: 2006, end: 2015, url: "PIT_20062007-20152016_dark.svg" }],
      LAK: [
        { start: 2002, end: 2009, url: "LAK_20022003-20092010_dark.svg" },
        { start: 2010, end: 2010, url: "LAK_20102011_dark.svg" },
        { start: 2011, end: 2018, url: "LAK_20112012-20182019_dark.svg" },
        { start: 2019, end: 2023, url: "LAK_20192020-20232024_dark.svg" },
      ],
      BOS: [
        { start: 2008, end: 2022, url: "BOS_20082009-20222023_dark.svg" },
        { start: 2024, end: 2024, url: "BOS_20082009-20222023_dark.svg" },
      ],
      TOR: [{ start: 1987, end: 2015, url: "TOR_19871988-20152016_dark.svg" }],
      STL: [{ start: 2008, end: 2024, url: "STL_20082009-20242025_light.svg" }],
      UTA: [{ start: 2024, end: 2024, url: "UTA_20242025-20242025_dark.svg" }],
    };

    if (logoEras[teamCodeUpper]) {
      for (const era of logoEras[teamCodeUpper]) {
        if (seasonYear >= era.start && seasonYear <= era.end) {
          return `${base}/${applySuffix(era.url)}`;
        }
      }
    }

    return `${base}/${teamCodeUpper}_${suffix}.svg`;
  },

  didWinStanleyCup(team, season) {
    return stanleyCupChampions.hasOwnProperty(season)
      ? stanleyCupChampions[season] === team
      : false;
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
