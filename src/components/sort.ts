import assertNever from "assert-never";

import { Path_Types } from "./tools";

export enum SortBy {
  name = "name",
  nameR = "nameR",
  mtimeN = "modify-new",
  mtimeO = "modify-old",
  ctimeN = "create-new",
  ctimeO = "create-old",
}

const getNameComparator = (revert = false) => {
  const val = localStorage.language,
    lang =
      typeof val === "string" && val.length >= 2 ? val.substring(0, 2) : "en",
    comparator = new Intl.Collator(lang, { numeric: true }).compare;
  return (a: string, b: string) => comparator(a, b) * -(+revert * 2 - 1);
};

const numN = (a: number, b: number) => b - a;
const numO = (a: number, b: number) => a - b;
const comparators = {
  [SortBy.name]: getNameComparator(),
  [SortBy.nameR]: getNameComparator(true),
  [SortBy.mtimeN]: numN,
  [SortBy.ctimeN]: numN,
  [SortBy.mtimeO]: numO,
  [SortBy.ctimeO]: numO,
};

export const getSorted = (
  list: Path_Types | null,
  sort: SortBy,
): Path_Types | null => {
  if (!list) return null;
  switch (sort) {
    case SortBy.name:
    case SortBy.nameR:
      return list.sortBy((i) => i.file.name, comparators[sort]);
    case SortBy.mtimeN:
    case SortBy.mtimeO:
      return list.sortBy((i) => i.file.stat.mtime, comparators[sort]);
    case SortBy.ctimeN:
    case SortBy.ctimeO:
      return list.sortBy((i) => i.file.stat.ctime, comparators[sort]);
    default:
      assertNever(sort);
  }
};
