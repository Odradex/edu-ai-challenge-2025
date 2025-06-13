/**
 * Robust TypeScript Validation Library
 * Provides type-safe validators for primitive and complex data structures
 * Perfect for validating pizza ordering data and other complex objects
 */

import { ValidationResult, Validator } from './validation-types';
export { ValidationResult, Validator } from './validation-types';

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
  optional(): this {
    const clone = this.clone();
    clone.isOptional = true;
    return clone as this;
  }

  /**
   * Sets a custom error message for validation failures
   */
  withMessage(message: string): this {
    const clone = this.clone();
    clone.customMessage = message;
    return clone as this;
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
 * String validator with chainable validation methods
 */
export class StringValidator extends BaseValidator<string> {
  private minLen?: number;
  private maxLen?: number;
  private regexPattern?: RegExp;

  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (value === undefined && this.isOptional) {
      return this.createSuccess(undefined as any);
    }

    // Check if value is string
    if (typeof value !== 'string') {
      return this.createError('Value must be a string');
    }

    // Validate minimum length
    if (this.minLen !== undefined && value.length < this.minLen) {
      return this.createError(`String must be at least ${this.minLen} characters long`);
    }

    // Validate maximum length
    if (this.maxLen !== undefined && value.length > this.maxLen) {
      return this.createError(`String must be no more than ${this.maxLen} characters long`);
    }

    // Validate pattern
    if (this.regexPattern && !this.regexPattern.test(value)) {
      return this.createError('String does not match the required pattern');
    }

    return this.createSuccess(value);
  }

  /**
   * Sets minimum length requirement
   */
  minLength(min: number): StringValidator {
    const clone = this.clone();
    clone.minLen = min;
    return clone;
  }

  /**
   * Sets maximum length requirement
   */
  maxLength(max: number): StringValidator {
    const clone = this.clone();
    clone.maxLen = max;
    return clone;
  }

  /**
   * Sets regex pattern requirement
   */
  pattern(regex: RegExp): StringValidator {
    const clone = this.clone();
    clone.regexPattern = regex;
    return clone;
  }

  /**
   * Validates email format
   */
  email(): StringValidator {
    return this.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).withMessage('Invalid email format');
  }

  /**
   * Validates phone number format
   */
  phone(): StringValidator {
    return this.pattern(/^\+?[\d\s-()]+$/).withMessage('Invalid phone number format');
  }

  protected clone(): StringValidator {
    const clone = new StringValidator();
    clone.isOptional = this.isOptional;
    clone.customMessage = this.customMessage;
    clone.minLen = this.minLen;
    clone.maxLen = this.maxLen;
    clone.regexPattern = this.regexPattern;
    return clone;
  }
}

/**
 * Number validator with range and type validation
 */
export class NumberValidator extends BaseValidator<number> {
  private minVal?: number;
  private maxVal?: number;
  private integerOnly = false;

  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (value === undefined && this.isOptional) {
      return this.createSuccess(undefined as any);
    }

    // Check if value is number
    if (typeof value !== 'number' || isNaN(value)) {
      return this.createError('Value must be a valid number');
    }

    // Check if integer is required
    if (this.integerOnly && (value % 1 !== 0)) {
      return this.createError('Value must be an integer');
    }

    // Validate minimum value
    if (this.minVal !== undefined && value < this.minVal) {
      return this.createError(`Number must be at least ${this.minVal}`);
    }

    // Validate maximum value
    if (this.maxVal !== undefined && value > this.maxVal) {
      return this.createError(`Number must be no more than ${this.maxVal}`);
    }

    return this.createSuccess(value);
  }

  /**
   * Sets minimum value requirement
   */
  min(min: number): NumberValidator {
    const clone = this.clone();
    clone.minVal = min;
    return clone;
  }

  /**
   * Sets maximum value requirement
   */
  max(max: number): NumberValidator {
    const clone = this.clone();
    clone.maxVal = max;
    return clone;
  }

  /**
   * Requires value to be an integer
   */
  integer(): NumberValidator {
    const clone = this.clone();
    clone.integerOnly = true;
    return clone;
  }

  /**
   * Requires value to be positive
   */
  positive(): NumberValidator {
    return this.min(0.01);
  }

  protected clone(): NumberValidator {
    const clone = new NumberValidator();
    clone.isOptional = this.isOptional;
    clone.customMessage = this.customMessage;
    clone.minVal = this.minVal;
    clone.maxVal = this.maxVal;
    clone.integerOnly = this.integerOnly;
    return clone;
  }
}

/**
 * Boolean validator
 */
export class BooleanValidator extends BaseValidator<boolean> {
  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (value === undefined && this.isOptional) {
      return this.createSuccess(undefined as any);
    }

    // Check if value is boolean
    if (typeof value !== 'boolean') {
      return this.createError('Value must be a boolean');
    }

    return this.createSuccess(value);
  }

  protected clone(): BooleanValidator {
    const clone = new BooleanValidator();
    clone.isOptional = this.isOptional;
    clone.customMessage = this.customMessage;
    return clone;
  }
}

/**
 * Date validator with date range validation
 */
export class DateValidator extends BaseValidator<Date> {
  private minDate?: Date;
  private maxDate?: Date;

  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (value === undefined && this.isOptional) {
      return this.createSuccess(undefined as any);
    }

    // Check if value is Date or can be converted to Date
    let date: Date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else {
      return this.createError('Value must be a valid date');
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return this.createError('Value must be a valid date');
    }

    // Validate minimum date
    if (this.minDate && date < this.minDate) {
      return this.createError(`Date must be after ${this.minDate.toISOString()}`);
    }

    // Validate maximum date
    if (this.maxDate && date > this.maxDate) {
      return this.createError(`Date must be before ${this.maxDate.toISOString()}`);
    }

    return this.createSuccess(date);
  }

  /**
   * Sets minimum date requirement
   */
  after(date: Date): DateValidator {
    const clone = this.clone();
    clone.minDate = date;
    return clone;
  }

  /**
   * Sets maximum date requirement
   */
  before(date: Date): DateValidator {
    const clone = this.clone();
    clone.maxDate = date;
    return clone;
  }

  protected clone(): DateValidator {
    const clone = new DateValidator();
    clone.isOptional = this.isOptional;
    clone.customMessage = this.customMessage;
    clone.minDate = this.minDate;
    clone.maxDate = this.maxDate;
    return clone;
  }
}

/**
 * Array validator with item validation
 */
export class ArrayValidator<T> extends BaseValidator<T[]> {
  private minItemCount?: number;
  private maxItemCount?: number;

  constructor(private itemValidator: BaseValidator<T>) {
    super();
  }

  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (value === undefined && this.isOptional) {
      return this.createSuccess(undefined as any);
    }

    // Check if value is array
    if (!Array.isArray(value)) {
      return this.createError('Value must be an array');
    }

    // Validate array length
    if (this.minItemCount !== undefined && value.length < this.minItemCount) {
      return this.createError(`Array must have at least ${this.minItemCount} items`);
    }

    if (this.maxItemCount !== undefined && value.length > this.maxItemCount) {
      return this.createError(`Array must have no more than ${this.maxItemCount} items`);
    }

    // Validate each item
    const errors: string[] = [];
    const validatedItems: T[] = [];

    for (let i = 0; i < value.length; i++) {
      const itemResult = this.itemValidator.validate(value[i]);
      if (!itemResult.isValid) {
        errors.push(`Item ${i}: ${itemResult.errors.join(', ')}`);
      } else {
        validatedItems.push(itemResult.value);
      }
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        errors
      };
    }

    return this.createSuccess(validatedItems);
  }

  /**
   * Sets minimum items requirement
   */
  minItems(min: number): ArrayValidator<T> {
    const clone = this.clone();
    clone.minItemCount = min;
    return clone;
  }

  /**
   * Sets maximum items requirement
   */
  maxItems(max: number): ArrayValidator<T> {
    const clone = this.clone();
    clone.maxItemCount = max;
    return clone;
  }

  protected clone(): ArrayValidator<T> {
    const clone = new ArrayValidator<T>(this.itemValidator);
    clone.isOptional = this.isOptional;
    clone.customMessage = this.customMessage;
    clone.minItemCount = this.minItemCount;
    clone.maxItemCount = this.maxItemCount;
    return clone;
  }
}

/**
 * Object validator with schema validation
 */
export class ObjectValidator<T> extends BaseValidator<T> {
  constructor(private schema: Record<string, BaseValidator<any>>) {
    super();
  }

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

  protected clone(): ObjectValidator<T> {
    const clone = new ObjectValidator<T>(this.schema);
    clone.isOptional = this.isOptional;
    clone.customMessage = this.customMessage;
    return clone;
  }
}

/**
 * Enum validator for validating against a set of allowed values
 */
export class EnumValidator<T extends string | number> extends BaseValidator<T> {
  constructor(private allowedValues: T[]) {
    super();
  }

  validate(value: unknown): ValidationResult {
    // Handle optional values
    if (value === undefined && this.isOptional) {
      return this.createSuccess(undefined as any);
    }

    // Check if value is in allowed values
    if (this.allowedValues.indexOf(value as T) === -1) {
      return this.createError(`Value must be one of: ${this.allowedValues.join(', ')}`);
    }

    return this.createSuccess(value as T);
  }

  protected clone(): EnumValidator<T> {
    const clone = new EnumValidator<T>(this.allowedValues);
    clone.isOptional = this.isOptional;
    clone.customMessage = this.customMessage;
    return clone;
  }
}

/**
 * Main Schema class providing static factory methods for all validators
 */
export class Schema {
  /**
   * Creates a string validator
   */
  static string(): StringValidator {
    return new StringValidator();
  }

  /**
   * Creates a number validator
   */
  static number(): NumberValidator {
    return new NumberValidator();
  }

  /**
   * Creates a boolean validator
   */
  static boolean(): BooleanValidator {
    return new BooleanValidator();
  }

  /**
   * Creates a date validator
   */
  static date(): DateValidator {
    return new DateValidator();
  }

  /**
   * Creates an object validator with the given schema
   */
  static object<T>(schema: Record<string, BaseValidator<any>>): ObjectValidator<T> {
    return new ObjectValidator<T>(schema);
  }

  /**
   * Creates an array validator with the given item validator
   */
  static array<T>(itemValidator: BaseValidator<T>): ArrayValidator<T> {
    return new ArrayValidator<T>(itemValidator);
  }

  /**
   * Creates an enum validator with the given allowed values
   */
  static enum<T extends string | number>(allowedValues: T[]): EnumValidator<T> {
    return new EnumValidator<T>(allowedValues);
  }

  /**
   * Creates a validator that accepts any value (useful for metadata fields)
   */
  static any(): BaseValidator<any> {
    return new class extends BaseValidator<any> {
      validate(value: unknown): ValidationResult {
        if (value === undefined && this.isOptional) {
          return this.createSuccess(undefined);
        }
        return this.createSuccess(value);
      }
      
      protected clone() {
        return new (this.constructor as any)();
      }
    }();
  }
}

// Pizza ordering system schemas - comprehensive examples

/**
 * Pizza size enumeration
 */
export type PizzaSize = 'small' | 'medium' | 'large' | 'extra-large';

/**
 * Pizza topping schema
 */
export const pizzaToppingSchema = Schema.object<{
  name: string;
  price: number;
  category: string;
  isVegetarian: boolean;
  isGlutenFree?: boolean;
}>({
  name: Schema.string().minLength(2).maxLength(50),
  price: Schema.number().min(0).max(20),
  category: Schema.enum(['meat', 'vegetable', 'cheese', 'sauce', 'seasoning']),
  isVegetarian: Schema.boolean(),
  isGlutenFree: Schema.boolean().optional()
});

/**
 * Pizza schema with comprehensive validation
 */
export const pizzaSchema = Schema.object<{
  id: string;
  name: string;
  description: string;
  size: PizzaSize;
  basePrice: number;
  toppings: Array<{
    name: string;
    price: number;
    category: string;
    isVegetarian: boolean;
    isGlutenFree?: boolean;
  }>;
  totalPrice: number;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  preparationTime: number;
  calories?: number;
}>({
  id: Schema.string().pattern(/^PIZZA_\d+$/).withMessage('Pizza ID must start with PIZZA_ followed by numbers'),
  name: Schema.string().minLength(3).maxLength(100),
  description: Schema.string().minLength(10).maxLength(500),
  size: Schema.enum<PizzaSize>(['small', 'medium', 'large', 'extra-large']),
  basePrice: Schema.number().min(5).max(50),
  toppings: Schema.array(pizzaToppingSchema).minItems(0).maxItems(15),
  totalPrice: Schema.number().min(5).max(100),
  isVegetarian: Schema.boolean(),
  isGlutenFree: Schema.boolean(),
  preparationTime: Schema.number().integer().min(10).max(60),
  calories: Schema.number().integer().min(100).max(3000).optional()
});

/**
 * Customer address schema
 */
export const addressSchema = Schema.object<{
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  apartmentNumber?: string;
  deliveryInstructions?: string;
}>({
  street: Schema.string().minLength(5).maxLength(200),
  city: Schema.string().minLength(2).maxLength(100),
  state: Schema.string().minLength(2).maxLength(50),
  zipCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/).withMessage('ZIP code must be in format 12345 or 12345-6789'),
  country: Schema.string().minLength(2).maxLength(50),
  apartmentNumber: Schema.string().maxLength(20).optional(),
  deliveryInstructions: Schema.string().maxLength(500).optional()
});

/**
 * Customer schema
 */
export const customerSchema = Schema.object<{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: Date;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    apartmentNumber?: string;
    deliveryInstructions?: string;
  };
  loyaltyPoints: number;
  isVip: boolean;
  preferences: {
    vegetarianOnly: boolean;
    glutenFree: boolean;
    spiceLevel: string;
    favoriteSize: PizzaSize;
  };
}>({
  id: Schema.string().pattern(/^CUST_\d+$/).withMessage('Customer ID must start with CUST_ followed by numbers'),
  firstName: Schema.string().minLength(2).maxLength(50),
  lastName: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().email(),
  phone: Schema.string().phone(),
  dateOfBirth: Schema.date().before(new Date()).optional(),
  address: addressSchema,
  loyaltyPoints: Schema.number().integer().min(0).max(10000),
  isVip: Schema.boolean(),
  preferences: Schema.object({
    vegetarianOnly: Schema.boolean(),
    glutenFree: Schema.boolean(),
    spiceLevel: Schema.enum(['none', 'mild', 'medium', 'hot', 'extreme']),
    favoriteSize: Schema.enum<PizzaSize>(['small', 'medium', 'large', 'extra-large'])
  })
});

/**
 * Pizza order schema
 */
export const orderSchema = Schema.object<{
  id: string;
  customerId: string;
  pizzas: Array<{
    id: string;
    name: string;
    description: string;
    size: PizzaSize;
    basePrice: number;
    toppings: Array<{
      name: string;
      price: number;
      category: string;
      isVegetarian: boolean;
      isGlutenFree?: boolean;
    }>;
    totalPrice: number;
    isVegetarian: boolean;
    isGlutenFree: boolean;
    preparationTime: number;
    calories?: number;
  }>;
  orderDate: Date;
  requestedDeliveryTime: Date;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    apartmentNumber?: string;
    deliveryInstructions?: string;
  };
  specialInstructions?: string;
  discountCode?: string;
  tip: number;
}>({
  id: Schema.string().pattern(/^ORDER_\d+$/).withMessage('Order ID must start with ORDER_ followed by numbers'),
  customerId: Schema.string().pattern(/^CUST_\d+$/),
  pizzas: Schema.array(pizzaSchema).minItems(1).maxItems(10),
  orderDate: Schema.date(),
  requestedDeliveryTime: Schema.date().after(new Date()),
  totalAmount: Schema.number().min(5).max(500),
  status: Schema.enum(['pending', 'confirmed', 'preparing', 'baking', 'ready', 'out-for-delivery', 'delivered', 'cancelled']),
  paymentMethod: Schema.enum(['credit-card', 'debit-card', 'cash', 'paypal', 'apple-pay', 'google-pay']),
  deliveryAddress: addressSchema,
  specialInstructions: Schema.string().maxLength(1000).optional(),
  discountCode: Schema.string().pattern(/^[A-Z0-9]{3,10}$/).optional(),
  tip: Schema.number().min(0).max(50)
});

// Export all validators and schemas
export default Schema; 