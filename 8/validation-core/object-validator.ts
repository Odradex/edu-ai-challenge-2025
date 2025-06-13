/**
 * Object Validator - Separate module for object validation
 * Provides type-safe validation for complex object structures
 */

import { ValidationResult, Validator } from './validation-types';

/**
 * Base validator class providing common functionality
 */
abstract class BaseValidator<T> implements Validator<T> {
  protected isOptional = false;
  protected customMessage?: string;

  abstract validate(value: unknown): ValidationResult;

  /**
   * Makes the validator optional - allows undefined values
   */
  optional(): Validator<T | undefined> {
    const clone = this.clone();
    clone.isOptional = true;
    return clone;
  }

  /**
   * Sets a custom error message for validation failures
   */
  withMessage(message: string): Validator<T> {
    const clone = this.clone();
    clone.customMessage = message;
    return clone;
  }

  /**
   * Creates a clone of the validator for chaining
   */
  protected abstract clone(): BaseValidator<T>;

  /**
   * Helper method to create error result
   */
  protected createError(message: string): ValidationResult {
    return {
      isValid: false,
      errors: [this.customMessage || message]
    };
  }

  /**
   * Helper method to create success result
   */
  protected createSuccess(value: T): ValidationResult {
    return {
      isValid: true,
      errors: [],
      value
    };
  }
}

/**
 * Object validator with schema validation
 * Validates complex object structures against defined schemas
 */
export class ObjectValidator<T> extends BaseValidator<T> {
  constructor(private schema: Record<string, Validator<any>>) {
    super();
  }

  /**
   * Validates an object against the defined schema
   * @param value - The value to validate
   * @returns ValidationResult with success/failure and errors
   */
  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (value === undefined && this.isOptional) {
      return this.createSuccess(undefined as any);
    }

    // Check if value is object
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return this.createError('Value must be an object');
    }

    const obj = value as Record<string, any>;
    const errors: string[] = [];
    const validatedObj: Record<string, any> = {};

    // Validate each property in schema
    for (const key in this.schema) {
      const validator = this.schema[key];
      const propResult = validator.validate(obj[key]);
      if (!propResult.isValid) {
        errors.push(`Property '${key}': ${propResult.errors.join(', ')}`);
      } else {
        validatedObj[key] = propResult.value;
      }
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        errors
      };
    }

    return this.createSuccess(validatedObj as T);
  }

  /**
   * Creates a copy of this validator for method chaining
   */
  protected clone(): ObjectValidator<T> {
    const clone = new ObjectValidator<T>(this.schema);
    clone.isOptional = this.isOptional;
    clone.customMessage = this.customMessage;
    return clone;
  }

  /**
   * Gets the schema used by this validator
   */
  getSchema(): Record<string, Validator<any>> {
    return { ...this.schema };
  }

  /**
   * Creates a new ObjectValidator with additional properties
   * @param additionalSchema - Additional schema properties to merge
   */
  extend<U>(additionalSchema: Record<string, Validator<any>>): ObjectValidator<T & U> {
    const mergedSchema = { ...this.schema, ...additionalSchema };
    return new ObjectValidator<T & U>(mergedSchema);
  }

  /**
   * Creates a new ObjectValidator with some properties removed
   * @param keysToOmit - Keys to remove from the schema
   */
  omit<K extends keyof T>(keysToOmit: K[]): ObjectValidator<Omit<T, K>> {
    const newSchema: Record<string, Validator<any>> = {};
    for (const key in this.schema) {
      if (keysToOmit.indexOf(key as K) === -1) {
        newSchema[key] = this.schema[key];
      }
    }
    return new ObjectValidator<Omit<T, K>>(newSchema);
  }

  /**
   * Creates a new ObjectValidator with only specific properties
   * @param keysToPick - Keys to keep in the schema
   */
  pick<K extends keyof T>(keysToPick: K[]): ObjectValidator<Pick<T, K>> {
    const newSchema: Record<string, Validator<any>> = {};
    for (const key of keysToPick) {
      if (this.schema[key as string]) {
        newSchema[key as string] = this.schema[key as string];
      }
    }
    return new ObjectValidator<Pick<T, K>>(newSchema);
  }
} 