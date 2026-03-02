"use client";

import { useEffect, useState } from "react";

type Prefs = {
  marketingEmails: boolean;
  transferReadyTexts: boolean;
  savedCardPlaceholder: boolean;
};

const KEY = "ff_prefs_v1";

function readPrefs(): Prefs {
  if (typeof window === "undefined") {
    return { marketingEmails: false, transferReadyTexts: true, savedCardPlaceholder: false };
  }
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { marketingEmails: false, transferReadyTexts: true, savedCardPlaceholder: false };
    const obj = JSON.parse(raw) || {};
    return {
      marketingEmails: !!obj.marketingEmails,
      transferReadyTexts: obj.transferReadyTexts !== false,
      savedCardPlaceholder: !!obj.savedCardPlaceholder,
    };
  } catch {
    return { marketingEmails: false, transferReadyTexts: true, savedCardPlaceholder: false };
  }
}

function writePrefs(p: Prefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Prefs>({ marketingEmails: false, transferReadyTexts: true, savedCardPlaceholder: false });

  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  function update(next: Partial<Prefs>) {
    setPrefs((prev) => {
      const merged = { ...prev, ...next };
      writePrefs(merged);
      return merged;
    });
  }

  return { prefs, update };
}
