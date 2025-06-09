const { Enigma, Rotor, plugboardSwap } = require('./enigma.js');

// Test Suite for Enigma Machine
class EnigmaTests {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  run() {
    console.log('Running Enigma Machine Tests...\n');
    
    for (const { name, fn } of this.tests) {
      try {
        const result = fn();
        if (result) {
          console.log(`✓ ${name}`);
          this.passed++;
        } else {
          console.log(`✗ ${name} - Test returned false`);
          this.failed++;
        }
      } catch (error) {
        console.log(`✗ ${name} - Error: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log(`\nTest Results: ${this.passed} passed, ${this.failed} failed`);
    console.log(`Coverage: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    return this.failed === 0;
  }
}

const tests = new EnigmaTests();

// Test 1: Basic Encryption/Decryption (No plugboard, default settings)
tests.test('Basic encryption and decryption should be symmetric', () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  const message = 'HELLO';
  const encrypted = enigma1.process(message);
  const decrypted = enigma2.process(encrypted);
  
  return message === decrypted;
});

// Test 2: Plugboard functionality
tests.test('Plugboard should work symmetrically', () => {
  const plugPairs = [['A', 'B'], ['C', 'D']];
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugPairs);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugPairs);
  
  const message = 'HELLO';
  const encrypted = enigma1.process(message);
  const decrypted = enigma2.process(encrypted);
  
  return message === decrypted;
});

// Test 3: Complex plugboard
tests.test('Complex plugboard configuration should work', () => {
  const plugPairs = [['A', 'Z'], ['B', 'Y'], ['C', 'X'], ['D', 'W']];
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugPairs);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugPairs);
  
  const message = 'ABCDEFGH';
  const encrypted = enigma1.process(message);
  const decrypted = enigma2.process(encrypted);
  
  return message === decrypted;
});

// Test 4: Different rotor positions
tests.test('Different rotor positions should work', () => {
  const positions = [5, 10, 15];
  const enigma1 = new Enigma([0, 1, 2], positions, [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], positions, [0, 0, 0], []);
  
  const message = 'TESTMESSAGE';
  const encrypted = enigma1.process(message);
  const decrypted = enigma2.process(encrypted);
  
  return message === decrypted;
});

// Test 5: Ring settings
tests.test('Ring settings should work correctly', () => {
  const ringSettings = [3, 7, 11];
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], ringSettings, []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], ringSettings, []);
  
  const message = 'RINGSETTING';
  const encrypted = enigma1.process(message);
  const decrypted = enigma2.process(encrypted);
  
  return message === decrypted;
});

// Test 6: Combined settings (positions, rings, plugboard)
tests.test('Combined settings should work together', () => {
  const positions = [2, 8, 14];
  const rings = [1, 5, 9];
  const plugs = [['E', 'F'], ['G', 'H']];
  
  const enigma1 = new Enigma([0, 1, 2], positions, rings, plugs);
  const enigma2 = new Enigma([0, 1, 2], positions, rings, plugs);
  
  const message = 'COMBINEDTEST';
  const encrypted = enigma1.process(message);
  const decrypted = enigma2.process(encrypted);
  
  return message === decrypted;
});

// Test 7: Long message
tests.test('Long messages should encrypt/decrypt correctly', () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
  
  const message = 'THISISAVERYLONGMESSAGETOTESTTHEENIGMAMACHINE';
  const encrypted = enigma1.process(message);
  const decrypted = enigma2.process(encrypted);
  
  return message === decrypted;
});

// Test 8: Non-alphabetic characters should pass through unchanged
tests.test('Non-alphabetic characters should pass through unchanged', () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const message = 'HELLO123 WORLD!';
  const result = enigma.process(message);
  
  // Check that numbers and punctuation are preserved
  return result.includes('123') && result.includes(' ') && result.includes('!');
});

// Test 9: Plugboard swap function
tests.test('Plugboard swap function should work correctly', () => {
  const pairs = [['A', 'B'], ['C', 'D']];
  
  return (
    plugboardSwap('A', pairs) === 'B' &&
    plugboardSwap('B', pairs) === 'A' &&
    plugboardSwap('C', pairs) === 'D' &&
    plugboardSwap('D', pairs) === 'C' &&
    plugboardSwap('E', pairs) === 'E' // Unchanged
  );
});

// Test 10: Rotor stepping
tests.test('Rotor stepping should work correctly', () => {
  const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 25);
  rotor.step();
  return rotor.position === 0; // Should wrap around
});

// Test 11: Rotor at notch detection
tests.test('Rotor notch detection should work', () => {
  const rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q', 0, 16); // Q is at position 16
  return rotor.atNotch();
});

// Test 12: Self-inverse property
tests.test('Enigma should be self-inverse (encrypt twice returns original)', () => {
  const enigma = new Enigma([0, 1, 2], [5, 10, 15], [2, 4, 6], [['A', 'B']]);
  const message = 'SELFTEST';
  
  const firstEncrypt = enigma.process(message);
  
  // Reset to same initial state
  const enigma2 = new Enigma([0, 1, 2], [5, 10, 15], [2, 4, 6], [['A', 'B']]);
  const secondEncrypt = enigma2.process(firstEncrypt);
  
  return message === secondEncrypt;
});

// Test 13: Different rotor orders
tests.test('Different rotor orders should produce different results', () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([2, 1, 0], [0, 0, 0], [0, 0, 0], []);
  
  const message = 'ROTORORDER';
  const result1 = enigma1.process(message);
  const result2 = enigma2.process(message);
  
  return result1 !== result2; // Should be different
});

// Test 14: Case insensitive input
tests.test('Lowercase input should be converted to uppercase', () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const result = enigma.process('hello');
  
  // Result should be all uppercase and not contain lowercase letters
  return result === result.toUpperCase() && !/[a-z]/.test(result);
});

// Test 15: Empty message
tests.test('Empty message should return empty string', () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  return enigma.process('') === '';
});

// Run all tests
const success = tests.run();
process.exit(success ? 0 : 1); 