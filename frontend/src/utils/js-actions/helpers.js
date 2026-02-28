import { PDFName, PDFDict } from "pdf-lib";

export const KNOWN_ACTION_KEYS = [
  "K",
  "F",
  "V",
  "C",
  "E",
  "X",
  "D",
  "U",
  "Fo",
  "Bl",
];

export function createEmptyActions() {
  const actions = {};
  for (const key of KNOWN_ACTION_KEYS) {
    actions[key] = [];
  }
  actions.A = [];
  actions._unknown = [];
  return actions;
}

export function resolveLookup(obj, context) {
  if (!obj) return null;
  if (obj instanceof PDFDict) return obj;
  if (context) {
    try {
      return context.lookup(obj);
    } catch {
      return null;
    }
  }
  return null;
}
