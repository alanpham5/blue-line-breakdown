// Profanity detection MUST use a public 3rd-party API (no local word lists).
//
// This uses PurgoMalum's public endpoint:
//   https://www.purgomalum.com/service/containsprofanity?text=...
//
// Returns { ok: true, profane: boolean } on success.
// Returns { ok: false, error: string } on failure.

const containsEndpoint = (text) =>
  `https://www.purgomalum.com/service/containsprofanity?text=${encodeURIComponent(
    String(text || "")
  )}`;

export async function checkTeamNameProfanity(name) {
  const text = String(name || "").trim();
  if (!text) return { ok: true, profane: false };

  try {
    const res = await fetch(containsEndpoint(text), { method: "GET" });
    if (!res.ok) {
      return { ok: false, error: `Profanity check failed (${res.status}).` };
    }
    const body = (await res.text()).trim().toLowerCase();
    if (body !== "true" && body !== "false") {
      return { ok: false, error: "Profanity check returned an invalid response." };
    }
    return { ok: true, profane: body === "true" };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || "Profanity check failed.",
    };
  }
}

