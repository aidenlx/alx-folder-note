// import { Set } from "immutable";
import minimatch from "minimatch";
import RegexParser from "regex-parser";

export type Filter = ((name: string) => boolean) | null;

const getRegex = (input: string): RegExp | null => {
  // https://github.com/IonicaBizau/regex-parser.js
  // Parse input
  let m = input.match(/(\/?)(.+)\1([a-z]*)/i);
  if (
    !m || //Invalid flags
    (m[3] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(m[3]))
  )
    return null;
  // Create the regular expression
  return new RegExp(m[2], m[3]);
};
const filterToRegex = (field: unknown): RegExp | string | null => {
  if (!field || typeof field !== "string") return null;
  return getRegex(field) ?? field;
};

export const getFilter = (fields: unknown): Filter => {
  const pattern = filterToRegex(fields);
  if (pattern) {
    return (name) => {
      if (typeof pattern === "string") return minimatch(name, pattern);
      else {
        const result = pattern.test(name);
        pattern.lastIndex = 0;
        return result;
      }
    };
  } else return null;
};
