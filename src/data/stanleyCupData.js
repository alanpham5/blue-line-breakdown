export const hardcodedChampions = {
  2008: "PIT",
  2009: "DET",
  2010: "CHI",
  2011: "BOS",
  2012: "LAK",
  2013: "CHI",
  2014: "LAK",
  2015: "CHI",
  2016: "PIT",
  2017: "PIT",
  2018: "WSH",
  2019: "STL",
  2020: "TBL",
  2021: "TBL",
  2022: "COL",
  2023: "VGK",
  2024: "FLA",
  2025: "FLA",
};

export const apiChampions = {};

export const stanleyCupChampions = Object.keys(apiChampions).length
  ? apiChampions
  : hardcodedChampions;
