/**
 * @file **improved-immutable-record** | Improved `Record` from immutable.js, for use in
 * TypeScript projects.
 * @author Ian Sanders
 * @copyright 2021 Ian Sanders
 * @license MIT
 */

import { Record } from "immutable";

/**
 * The unique symbol that must be set as the default value for any required property.
 */
export const required = Symbol("Required Value (No Default Available)");

/**
 * Create a new factory for generating instances of `ImprovedRecord`.
 *
 * @template Shape The interface representing the shape of the records to be generated. Properties
 * with default values should be marked optional in the interface (`property?: Type`).
 *
 * @param defaults An object mapping property names to their default values. All required properties
 * must be set to the `required` unique symbol value in order to be registered by immutable.js.
 * @param name An optional descriptive name for the record. This may be useful for debugging.
 *
 * @returns A factory method that can be used to create new record instances matching the shape.
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function IRecord<Shape extends {}>(
  defaults: DefaultsFor<Shape>,
  name?: string,
): IRecordFactory<NoExplicitUndefined<Shape>> {
  return Record(defaults, name) as any;
}

export interface IRecordFactory<Shape> {
  (values: Shape): IRecordOf<Shape>;
  new (values: Shape): IRecordOf<Shape>;

  /**
   * The name set when creating the factory.
   */
  displayName: string;
}

/**
 * Represents an `ImprovedRecord` instance with the shape provided.
 */
export type IRecordOf<Shape> = IRecordCore<Shape> & Readonly<Required<Shape>>;

/**
 * Any instance of any `ImprovedRecord`. Caution - most of the time you will not need this type.
 */
export type IRecord = IRecordOf<{}>;

/**
 * @alias Record.isRecord
 * @param maybeRecord An item to check and see if it is a record.
 */
export const isRecord = (maybeRecord: any): maybeRecord is IRecord =>
  Record.isRecord(maybeRecord);

/**
 * @alias Record.getDescriptiveName
 * @param record A record to get the name of.
 */
export const getDescriptiveName = (record: IRecordCore<any>): string =>
  Record.getDescriptiveName(record as Record<any>);

// --- Internal Types ---

/**
 * Any key of `T` for which the property is optional (defined with `?:`).
 */
type OptionalKey<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T] &
  string;

/**
 * Shape of the default values object corresponding to the shape `Shape`.
 */
type DefaultsFor<Shape> = {
  [K in keyof Shape]-?: K extends OptionalKey<Shape>
    ? Shape[K]
    : typeof required;
};

/**
 * Removes `undefined` from every property while maintaining optionality.
 */
type NoExplicitUndefined<T> = { [K in keyof T]: Exclude<T[K], undefined> };

interface IRecordCore<Shape>
  extends Omit<
    Record<Required<Shape>>,
    "delete" | "remove" | "clear" | "deleteIn" | "removeIn"
  > {
  /**
   * Returns a new instance of this Record type with the value for the
   * specific key set to its default value.
   *
   * Entries without defaults cannot be deleted.
   *
   * @alias remove
   */
  delete<K extends OptionalKey<Shape>>(key: K): this;
  remove<K extends OptionalKey<Shape>>(key: K): this;
}
