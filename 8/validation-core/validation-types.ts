/**
 * Shared validation types and interfaces
 * Used across all validation modules
 */

/**
 * Validation result interface containing validation status and errors
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of error messages if validation failed */
  errors: string[];
  /** The validated value (may be transformed) */
  value?: any;
}

/**
 * Base validator interface that all validators must implement
 */
export interface Validator<T> {
  /** Validates a value and returns the result */
  validate(value: unknown): ValidationResult;
  /** Makes this validator accept undefined values */
  optional(): Validator<T | undefined>;
  /** Sets a custom error message for this validator */
  withMessage(message: string): Validator<T>;
} 