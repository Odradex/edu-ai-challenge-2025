/**
 * Simple Pizza Ordering Example
 * Demonstrates the TypeScript Validation Library usage
 */

import { Schema } from '../validation-core/validation-library';
import { ObjectValidator } from '../validation-core/object-validator';

/**
 * Pizza size enumeration - simplified
 */
export type PizzaSize = 'small' | 'medium' | 'large';

/**
 * Simple pizza interface
 */
export interface Pizza {
  id: string;
  name: string;
  size: PizzaSize;
  price: number;
  isVegetarian: boolean;
}

/**
 * Simple customer interface
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/**
 * Simple order interface
 */
export interface Order {
  id: string;
  customerId: string;
  pizzas: Pizza[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered';
}

/**
 * Pizza validation schema - simplified
 */
export const pizzaSchema = new ObjectValidator<Pizza>({
  id: Schema.string().pattern(/^PIZZA_\d+$/),
  name: Schema.string().minLength(3).maxLength(50),
  size: Schema.enum<PizzaSize>(['small', 'medium', 'large']),
  price: Schema.number().min(5).max(30),
  isVegetarian: Schema.boolean()
});

/**
 * Customer validation schema - simplified
 */
export const customerSchema = new ObjectValidator<Customer>({
  id: Schema.string().pattern(/^CUST_\d+$/),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().email(),
  phone: Schema.string().pattern(/^\+?[\d\s-()]+$/)
});

/**
 * Order validation schema - simplified
 */
export const orderSchema = new ObjectValidator<Order>({
  id: Schema.string().pattern(/^ORDER_\d+$/),
  customerId: Schema.string().pattern(/^CUST_\d+$/),
  pizzas: Schema.array(pizzaSchema as any).minItems(1).maxItems(5),
  totalAmount: Schema.number().min(5).max(150),
  status: Schema.enum(['pending', 'confirmed', 'delivered'])
});

/**
 * Example usage demonstrating the validation library
 */
export function runPizzaExample() {
  console.log('🍕 Pizza Ordering System - Validation Example\n');

  // ========================================
  // ✅ VALID DATA EXAMPLES
  // ========================================
  
  // Example pizza data
  const pizzaData = {
    id: 'PIZZA_001',
    name: 'Margherita',
    size: 'large',
    price: 12.99,
    isVegetarian: true
  };

  // Example customer data
  const customerData = {
    id: 'CUST_123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123'
  };

  // Example order data
  const orderData = {
    id: 'ORDER_001',
    customerId: 'CUST_123',
    pizzas: [pizzaData],
    totalAmount: 12.99,
    status: 'pending'
  };

  // Validate valid data
  const pizzaResult = pizzaSchema.validate(pizzaData);
  console.log('✅ Valid Pizza validation:', pizzaResult.isValid ? '✅ Valid' : '❌ Invalid');

  const customerResult = customerSchema.validate(customerData);
  console.log('✅ Valid Customer validation:', customerResult.isValid ? '✅ Valid' : '❌ Invalid');

  const orderResult = orderSchema.validate(orderData);
  console.log('✅ Valid Order validation:', orderResult.isValid ? '✅ Valid' : '❌ Invalid');

  console.log('\n========================================');
  
  // ========================================
  // ❌ INVALID DATA EXAMPLES
  // ========================================
  
  console.log('❌ VALIDATION FAILURES - See Error Messages:\n');

  // Invalid pizza - wrong ID format and price too high
  const invalidPizza = {
    id: 'INVALID_ID',  // Should be PIZZA_XXX
    name: 'X',         // Too short (min 3 chars)
    size: 'jumbo',     // Invalid size
    price: 50,         // Too expensive (max $30)
    isVegetarian: 'yes' // Wrong type (should be boolean)
  };

  const invalidPizzaResult = pizzaSchema.validate(invalidPizza);
  console.log('❌ Invalid Pizza validation:', invalidPizzaResult.isValid ? '✅ Valid' : '❌ Invalid');
  if (!invalidPizzaResult.isValid) {
    console.log('   Errors:', invalidPizzaResult.errors);
  }

  // Invalid customer - bad email and ID
  const invalidCustomer = {
    id: 'USER_123',           // Wrong format (should be CUST_XXX)
    name: 'J',                // Too short
    email: 'not-an-email',    // Invalid email format
    phone: 'abc-def-ghij'     // Invalid phone format
  };

  const invalidCustomerResult = customerSchema.validate(invalidCustomer);
  console.log('\n❌ Invalid Customer validation:', invalidCustomerResult.isValid ? '✅ Valid' : '❌ Invalid');
  if (!invalidCustomerResult.isValid) {
    console.log('   Errors:', invalidCustomerResult.errors);
  }

  // Invalid order - empty pizzas array and wrong status
  const invalidOrder = {
    id: 'ORDER_001',
    customerId: 'CUST_123',
    pizzas: [],               // Empty array (min 1 pizza)
    totalAmount: 2,           // Too low (min $5)
    status: 'cancelled'       // Invalid status
  };

  const invalidOrderResult = orderSchema.validate(invalidOrder);
  console.log('\n❌ Invalid Order validation:', invalidOrderResult.isValid ? '✅ Valid' : '❌ Invalid');
  if (!invalidOrderResult.isValid) {
    console.log('   Errors:', invalidOrderResult.errors);
  }

  console.log('\n🎉 Pizza example completed - showing both valid and invalid cases!');
}

// Export the example function for use in other files
// To run: import { runPizzaExample } from './examples/pizza-example'; 