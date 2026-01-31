export const hardcodedChampions = {
  "2008": "DET",
  "2009": "PIT",
  "2010": "CHI",
  "2011": "BOS",
  "2012": "LAK",
  "2013": "CHI",
  "2014": "LAK",
  "2015": "CHI",
  "2016": "PIT",
  "2017": "PIT",
  "2018": "WSH",
  "2019": "STL",
  "2020": "TBL",
  "2021": "TBL",
  "2022": "COL",
  "2023": "FLA",
  "2024": "FLA"
};
export const apiChampions = {
  "2007": "DET",
  "2008": "PIT",
  "2009": "CHI",
  "2010": "BOS",
  "2011": "LAK",
  "2012": "CHI",
  "2013": "LAK",
  "2014": "CHI",
  "2015": "PIT",
  "2016": "PIT",
  "2017": "WSH",
  "2018": "STL",
  "2019": "TBL",
  "2020": "TBL",
  "2021": "COL",
  "2022": "VGK",
  "2023": "FLA",
  "2024": "FLA"
};
export const stanleyCupChampions = Object.keys(apiChampions).length
  ? apiChampions
  : hardcodedChampions;