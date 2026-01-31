import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const FILE_PATH = path.resolve("src/data/stanleyCupData.js");
const API_URL =
  "https://records.nhl.com/site/api/award-details?cayenneExp=trophyCategoryId=1%20and%20trophyId=1&include=seasonId&include=team.triCode&sort=seasonId&dir=DESC";

async function run() {
  const res = await fetch(API_URL);
  const json = await res.json();

  if (!json?.data?.length) {
    console.log("Empty API response. Skipping update.");
    return;
  }

  const seen = new Set();
  const mapped = {};

  for (const row of json.data) {
    const season = Number(row.seasonId.toString().slice(0, 4));

    if (!seen.has(season)) {
      seen.add(season);
      mapped[season] = row.team.triCode;
    }
  }

  if (!Object.keys(mapped).length) {
    console.log("No parsed data. Skipping update.");
    return;
  }

  const existing = require("../src/data/stanleyCupData.js");

  const file = `
export const hardcodedChampions = ${JSON.stringify(
    existing.hardcodedChampions,
    null,
    2
  )};

export const apiChampions = ${JSON.stringify(mapped, null, 2)};

export const stanleyCupChampions = Object.keys(apiChampions).length
  ? apiChampions
  : hardcodedChampions;
`;

  fs.writeFileSync(FILE_PATH, file.trim());
  console.log("Stanley Cup data updated.");
}

run();
