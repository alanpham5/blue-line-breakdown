import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { hardcodedChampions as existing } from "../src/data/stanleyCupData.js";

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
    const seasonId = row.seasonId.toString();
    const displayYear = Number(seasonId.slice(0, 4));

    if (!seen.has(displayYear)) {
      seen.add(displayYear);
      mapped[displayYear] = row.team.triCode;
    }
  }

  if (!Object.keys(mapped).length) {
    console.log("No parsed data. Skipping update.");
    return;
  }

  const fileContent = `
export const hardcodedChampions = ${JSON.stringify(existing, null, 2)};
export const apiChampions = ${JSON.stringify(mapped, null, 2)};
export const stanleyCupChampions = Object.keys(apiChampions).length
  ? apiChampions
  : hardcodedChampions;
`;

  fs.writeFileSync(FILE_PATH, fileContent.trim());
  console.log("Stanley Cup data updated.");
}

run();
