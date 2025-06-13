/**
 * Comprehensive Unit Tests for TypeScript Validation Library
 * Tests all validators, edge cases, and simplified pizza examples
 */

import {
  Schema,
  ValidationResult,
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  ArrayValidator,
  EnumValidator
} from '../validation-core/validation-library';

import { ObjectValidator } from '../validation-core/object-validator';
import { pizzaSchema, customerSchema, orderSchema, PizzaSize } from '../examples/pizza-example';

describe('Validation Library', () => {
  
  // Helper function to test validation
  const expectValid = (result: ValidationResult, expectedValue?: any) => {
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    if (expectedValue !== undefined) {
      expect(result.value).toEqual(expectedValue);
    }
  };

  const expectInvalid = (result: ValidationResult, expectedErrors?: string[]) => {
    expect(result.isValid).toBe(false);
    if (expectedErrors) {
      expect(result.errors).toEqual(expectedErrors);
    } else {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  };

  describe('StringValidator', () => {
    test('validates basic strings', () => {
      const validator = Schema.string();
      expectValid(validator.validate('hello'), 'hello');
      expectValid(validator.validate(''), '');
      expectInvalid(validator.validate(123));
      expectInvalid(validator.validate(null));
      expectInvalid(validator.validate(undefined));
    });

    test('validates optional strings', () => {
      const validator = Schema.string().optional();
      expectValid(validator.validate('hello'), 'hello');
      expectValid(validator.validate(undefined), undefined);
      expectInvalid(validator.validate(123));
    });

    test('validates string length', () => {
      const validator = Schema.string().minLength(3).maxLength(10);
      expectValid(validator.validate('hello'), 'hello');
      expectValid(validator.validate('123'), '123');
      expectValid(validator.validate('1234567890'), '1234567890');
      expectInvalid(validator.validate('hi'));
      expectInvalid(validator.validate('this is too long'));
    });

    test('validates string patterns', () => {
      const validator = Schema.string().pattern(/^[A-Z]+$/);
      expectValid(validator.validate('HELLO'), 'HELLO');
      expectInvalid(validator.validate('hello'));
      expectInvalid(validator.validate('Hello'));
      expectInvalid(validator.validate('HELLO123'));
    });

    test('validates email format', () => {
      const validator = Schema.string().email();
      expectValid(validator.validate('test@example.com'), 'test@example.com');
      expectValid(validator.validate('user.name+tag@example.co.uk'), 'user.name+tag@example.co.uk');
      expectInvalid(validator.validate('invalid-email'));
      expectInvalid(validator.validate('test@'));
      expectInvalid(validator.validate('@example.com'));
    });

    test('validates phone format', () => {
      const validator = Schema.string().phone();
      expectValid(validator.validate('+1-555-123-4567'), '+1-555-123-4567');
      expectValid(validator.validate('(555) 123-4567'), '(555) 123-4567');
      expectValid(validator.validate('5551234567'), '5551234567');
      expectInvalid(validator.validate('abc-def-ghij'));
    });

    test('supports custom error messages', () => {
      const validator = Schema.string().withMessage('Custom error message');
      const result = validator.validate(123);
      expectInvalid(result, ['Custom error message']);
    });

    test('chains validation methods', () => {
      const validator = Schema.string()
        .minLength(5)
        .maxLength(20)
        .pattern(/^[a-zA-Z]+$/)
        .withMessage('Invalid name format');
      
      expectValid(validator.validate('HelloWorld'), 'HelloWorld');
      expectInvalid(validator.validate('Hi'), ['Invalid name format']);
      expectInvalid(validator.validate('Hello123'), ['Invalid name format']);
    });
  });

  describe('NumberValidator', () => {
    test('validates basic numbers', () => {
      const validator = Schema.number();
      expectValid(validator.validate(42), 42);
      expectValid(validator.validate(0), 0);
      expectValid(validator.validate(-5.5), -5.5);
      expectInvalid(validator.validate('42'));
      expectInvalid(validator.validate(NaN));
      expectInvalid(validator.validate(null));
    });

    test('validates optional numbers', () => {
      const validator = Schema.number().optional();
      expectValid(validator.validate(42), 42);
      expectValid(validator.validate(undefined), undefined);
      expectInvalid(validator.validate('42'));
    });

    test('validates number range', () => {
      const validator = Schema.number().min(0).max(100);
      expectValid(validator.validate(50), 50);
      expectValid(validator.validate(0), 0);
      expectValid(validator.validate(100), 100);
      expectInvalid(validator.validate(-1));
      expectInvalid(validator.validate(101));
    });

    test('validates integers', () => {
      const validator = Schema.number().integer();
      expectValid(validator.validate(42), 42);
      expectValid(validator.validate(0), 0);
      expectValid(validator.validate(-5), -5);
      expectInvalid(validator.validate(42.5));
      expectInvalid(validator.validate(0.1));
    });

    test('validates positive numbers', () => {
      const validator = Schema.number().positive();
      expectValid(validator.validate(1), 1);
      expectValid(validator.validate(0.01), 0.01);
      expectInvalid(validator.validate(0));
      expectInvalid(validator.validate(-1));
    });

    test('chains validation methods', () => {
      const validator = Schema.number()
        .integer()
        .min(1)
        .max(100)
        .withMessage('Invalid score');
      
      expectValid(validator.validate(85), 85);
      expectInvalid(validator.validate(0), ['Invalid score']);
      expectInvalid(validator.validate(101), ['Invalid score']);
      expectInvalid(validator.validate(85.5), ['Invalid score']);
    });
  });

  describe('BooleanValidator', () => {
    test('validates basic booleans', () => {
      const validator = Schema.boolean();
      expectValid(validator.validate(true), true);
      expectValid(validator.validate(false), false);
      expectInvalid(validator.validate('true'));
      expectInvalid(validator.validate(1));
      expectInvalid(validator.validate(0));
    });

    test('validates optional booleans', () => {
      const validator = Schema.boolean().optional();
      expectValid(validator.validate(true), true);
      expectValid(validator.validate(undefined), undefined);
      expectInvalid(validator.validate('true'));
    });
  });

  describe('DateValidator', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    test('validates basic dates', () => {
      const validator = Schema.date();
      expectValid(validator.validate(now), now);
      expectValid(validator.validate('2023-01-01'), new Date('2023-01-01'));
      expectValid(validator.validate(1640995200000), new Date(1640995200000));
      expectInvalid(validator.validate('invalid-date'));
      expectInvalid(validator.validate({}));
    });

    test('validates optional dates', () => {
      const validator = Schema.date().optional();
      expectValid(validator.validate(now), now);
      expectValid(validator.validate(undefined), undefined);
      expectInvalid(validator.validate('invalid'));
    });

    test('validates date ranges', () => {
      const validator = Schema.date().after(yesterday).before(tomorrow);
      expectValid(validator.validate(now));
      expectInvalid(validator.validate(new Date(yesterday.getTime() - 1000))); // 1 second before yesterday
      expectInvalid(validator.validate(new Date(tomorrow.getTime() + 1000))); // 1 second after tomorrow
    });
  });

  describe('ArrayValidator', () => {
    test('validates basic arrays', () => {
      const validator = Schema.array(Schema.string());
      expectValid(validator.validate(['a', 'b', 'c']), ['a', 'b', 'c']);
      expectValid(validator.validate([]), []);
      expectInvalid(validator.validate('not an array'));
      expectInvalid(validator.validate([1, 2, 3])); // Items must be strings
    });

    test('validates optional arrays', () => {
      const validator = Schema.array(Schema.string()).optional();
      expectValid(validator.validate(['a', 'b']), ['a', 'b']);
      expectValid(validator.validate(undefined), undefined);
      expectInvalid(validator.validate([1, 2]));
    });

    test('validates array length', () => {
      const validator = Schema.array(Schema.string()).minItems(2).maxItems(4);
      expectValid(validator.validate(['a', 'b']), ['a', 'b']);
      expectValid(validator.validate(['a', 'b', 'c', 'd']), ['a', 'b', 'c', 'd']);
      expectInvalid(validator.validate(['a']));
      expectInvalid(validator.validate(['a', 'b', 'c', 'd', 'e']));
    });

    test('validates nested arrays', () => {
      const validator = Schema.array(Schema.array(Schema.number()));
      expectValid(validator.validate([[1, 2], [3, 4]]), [[1, 2], [3, 4]]);
      expectInvalid(validator.validate([['a', 'b'], [3, 4]]));
    });
  });

  describe('ObjectValidator', () => {
    test('validates basic objects', () => {
      const validator = new ObjectValidator({
        name: Schema.string(),
        age: Schema.number()
      });
      
      const validData = { name: 'John', age: 30 };
      expectValid(validator.validate(validData), validData);
      
      expectInvalid(validator.validate({ name: 'John' })); // missing age
      expectInvalid(validator.validate({ name: 123, age: 30 })); // wrong type
      expectInvalid(validator.validate('not an object'));
      expectInvalid(validator.validate(null));
    });

    test('validates optional objects', () => {
      const validator = new ObjectValidator({
        name: Schema.string(),
        age: Schema.number().optional()
      });
      
      expectValid(validator.validate({ name: 'John', age: 30 }));
      expectValid(validator.validate({ name: 'John' }));
      expectInvalid(validator.validate({ age: 30 })); // missing required name
    });

    test('validates nested objects', () => {
      const validator = new ObjectValidator({
        user: new ObjectValidator({
          name: Schema.string(),
          email: Schema.string().email()
        }),
        settings: new ObjectValidator({
          notifications: Schema.boolean()
        }).optional()
      });
      
      const validData = {
        user: { name: 'John', email: 'john@example.com' },
        settings: { notifications: true }
      };
      expectValid(validator.validate(validData));
      
      expectValid(validator.validate({
        user: { name: 'John', email: 'john@example.com' }
      }));
      
      expectInvalid(validator.validate({
        user: { name: 'John', email: 'invalid-email' }
      }));
    });
  });

  describe('EnumValidator', () => {
    test('validates string enums', () => {
      const validator = Schema.enum(['red', 'green', 'blue']);
      expectValid(validator.validate('red'), 'red');
      expectValid(validator.validate('green'), 'green');
      expectValid(validator.validate('blue'), 'blue');
      expectInvalid(validator.validate('yellow'));
      expectInvalid(validator.validate(123));
    });

    test('validates number enums', () => {
      const validator = Schema.enum([1, 2, 3]);
      expectValid(validator.validate(1), 1);
      expectValid(validator.validate(2), 2);
      expectValid(validator.validate(3), 3);
      expectInvalid(validator.validate(4));
      expectInvalid(validator.validate('1'));
    });

    test('validates optional enums', () => {
      const validator = Schema.enum(['a', 'b', 'c']).optional();
      expectValid(validator.validate('a'), 'a');
      expectValid(validator.validate(undefined), undefined);
      expectInvalid(validator.validate('d'));
    });
  });

  describe('AnyValidator', () => {
    test('accepts any value', () => {
      const validator = Schema.any();
      expectValid(validator.validate('string'), 'string');
      expectValid(validator.validate(123), 123);
      expectValid(validator.validate(true), true);
      expectValid(validator.validate({}), {});
      expectValid(validator.validate([]), []);
      expectValid(validator.validate(null), null);
    });

    test('handles optional any', () => {
      const validator = Schema.any().optional();
      expectValid(validator.validate('value'), 'value');
      expectValid(validator.validate(undefined), undefined);
    });
  });

  // Simplified Pizza Example Tests
  describe('Pizza Example Schemas', () => {
    describe('PizzaSchema', () => {
      test('validates simple pizza', () => {
        const validPizza = {
          id: 'PIZZA_123',
          name: 'Margherita',
          size: 'large' as PizzaSize,
          price: 12.99,
          isVegetarian: true
        };
        expectValid(pizzaSchema.validate(validPizza));
      });

      test('rejects invalid pizza ID format', () => {
        const invalidPizza = {
          id: 'INVALID_ID',
          name: 'Margherita',
          size: 'large' as PizzaSize,
          price: 12.99,
          isVegetarian: true
        };
        expectInvalid(pizzaSchema.validate(invalidPizza));
      });

      test('rejects invalid pizza size', () => {
        const invalidPizza = {
          id: 'PIZZA_123',
          name: 'Margherita',
          size: 'jumbo' as PizzaSize,
          price: 12.99,
          isVegetarian: true
        };
        expectInvalid(pizzaSchema.validate(invalidPizza));
      });
    });

    describe('CustomerSchema', () => {
      test('validates simple customer', () => {
        const validCustomer = {
          id: 'CUST_12345',
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-123-4567'
        };
        expectValid(customerSchema.validate(validCustomer));
      });

      test('rejects invalid email format', () => {
        const invalidCustomer = {
          id: 'CUST_12345',
          name: 'John Doe',
          email: 'invalid-email',
          phone: '+1-555-123-4567'
        };
        expectInvalid(customerSchema.validate(invalidCustomer));
      });
    });

    describe('OrderSchema', () => {
      test('validates simple order', () => {
        const validOrder = {
          id: 'ORDER_98765',
          customerId: 'CUST_12345',
          pizzas: [
            {
              id: 'PIZZA_001',
              name: 'Margherita',
              size: 'large' as PizzaSize,
              price: 12.99,
              isVegetarian: true
            }
          ],
          totalAmount: 12.99,
          status: 'pending' as const
        };
        expectValid(orderSchema.validate(validOrder));
      });

      test('rejects empty pizza array', () => {
        const invalidOrder = {
          id: 'ORDER_98765',
          customerId: 'CUST_12345',
          pizzas: [],
          totalAmount: 12.99,
          status: 'pending' as const
        };
        expectInvalid(orderSchema.validate(invalidOrder));
      });

      test('rejects invalid order status', () => {
        const invalidOrder = {
          id: 'ORDER_98765',
          customerId: 'CUST_12345',
          pizzas: [
            {
              id: 'PIZZA_001',
              name: 'Margherita',
              size: 'large' as PizzaSize,
              price: 12.99,
              isVegetarian: true
            }
          ],
          totalAmount: 12.99,
          status: 'invalid-status'
        };
        expectInvalid(orderSchema.validate(invalidOrder));
      });
    });
  });

  // Edge Cases and Error Handling
  describe('Edge Cases', () => {
    test('handles deeply nested validation errors', () => {
      const complexSchema = new ObjectValidator({
        level1: new ObjectValidator({
          level2: new ObjectValidator({
            level3: Schema.string().minLength(10)
          })
        })
      });

      const result = complexSchema.validate({
        level1: {
          level2: {
            level3: 'short'
          }
        }
      });

      expectInvalid(result);
      expect(result.errors[0]).toContain('level1');
      expect(result.errors[0]).toContain('level2');
      expect(result.errors[0]).toContain('level3');
    });

    test('handles multiple validation errors in arrays', () => {
      const arraySchema = Schema.array(Schema.string().minLength(3));
      const result = arraySchema.validate(['good', 'x', 'valid', 'y']);
      
      expectInvalid(result);
      expect(result.errors.length).toBe(2); // Two invalid items at index 1 and 3
      expect(result.errors[0]).toContain('Item 1');
      expect(result.errors[1]).toContain('Item 3');
    });

    test('handles circular reference detection', () => {
      // This test ensures the library doesn't crash on circular references
      const obj: any = { name: 'test' };
      obj.self = obj;
      
      const schema = new ObjectValidator({
        name: Schema.string(),
        self: Schema.any().optional()
      });
      
      // Should not throw an error, but may not validate the circular reference
      const result = schema.validate(obj);
      expect(result.isValid).toBe(true);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    test('handles large arrays efficiently', () => {
      const largeArray = Array(1000).fill('valid-string');
      const schema = Schema.array(Schema.string());
      
      const startTime = Date.now();
      const result = schema.validate(largeArray);
      const endTime = Date.now();
      
      expectValid(result);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    test('handles complex nested objects efficiently', () => {
      const complexObject = {
        users: Array(100).fill({
          id: 'CUST_123',
          name: 'Test User',
          email: 'test@example.com',
          phone: '+1-555-0123'
        })
      };

      const schema = new ObjectValidator({
        users: Schema.array(new ObjectValidator({
          id: Schema.string(),
          name: Schema.string(),
          email: Schema.string().email(),
          phone: Schema.string()
        }) as any)
      });

      const startTime = Date.now();
      const result = schema.validate(complexObject);
      const endTime = Date.now();

      expectValid(result);
      expect(endTime - startTime).toBeLessThan(500); // Should complete in under 500ms
    });
  });
});

// Test utilities are defined within the test scope above 