import { Set } from "immutable";
import minimatch from "minimatch";

export type Filter = ((name: string) => boolean) | null;

const RegExpPattern = /^\/(.+)\/([gimsuy]*)$/;
const getRegex = (str: string): RegExp | null => {
  if (RegExpPattern.test(str)) {
    const [, pattern, flags] = str.match(RegExpPattern) as RegExpMatchArray;
    return new RegExp(pattern, flags ?? undefined);
  } else return null;
};
const filterToRegex = (fields: unknown): Set<RegExp | string> | null => {
  if (!fields) return null;
  let patterns: Set<string>;
  if (typeof fields === "string") patterns = Set([fields]);
  else if (Array.isArray(fields))
    patterns = Set(fields.filter((v) => typeof v === "string"));
  else return null;

  const returns = patterns.map((raw) => getRegex(raw) ?? raw);
  return returns.isEmpty() ? null : returns;
};

export const getFilter = (fields: unknown): Filter => {
  const patterns = filterToRegex(fields);
  if (patterns) {
    return (name) => {
      for (const p of patterns) {
        if (typeof p === "string" ? minimatch(name, p) : p.test(name))
          return true;
      }
      return false;
    };
  } else return null;
};
