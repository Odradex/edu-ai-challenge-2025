import { Ship } from '../src/Ship.js';

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(3, ['00', '01', '02']);
  });

  describe('constructor', () => {
    test('should create ship with correct length and locations', () => {
      expect(ship.length).toBe(3);
      expect(ship.locations).toEqual(['00', '01', '02']);
      expect(ship.hits).toEqual([false, false, false]);
    });

    test('should create ship with default empty locations', () => {
      const emptyShip = new Ship(2);
      expect(emptyShip.length).toBe(2);
      expect(emptyShip.locations).toEqual([]);
      expect(emptyShip.hits).toEqual([false, false]);
    });

    test('should create independent copy of locations array', () => {
      const locations = ['10', '11'];
      const newShip = new Ship(2, locations);
      locations.push('12');
      expect(newShip.locations).toEqual(['10', '11']);
    });
  });

  describe('isAtLocation', () => {
    test('should return true for valid ship location', () => {
      expect(ship.isAtLocation('01')).toBe(true);
    });

    test('should return false for invalid location', () => {
      expect(ship.isAtLocation('99')).toBe(false);
    });

    test('should return false for empty location string', () => {
      expect(ship.isAtLocation('')).toBe(false);
    });
  });

  describe('hit', () => {
    test('should successfully hit ship at valid location', () => {
      const result = ship.hit('01');
      expect(result).toBe(true);
      expect(ship.hits[1]).toBe(true);
    });

    test('should return false for hit at invalid location', () => {
      const result = ship.hit('99');
      expect(result).toBe(false);
      expect(ship.hits).toEqual([false, false, false]);
    });

    test('should allow multiple hits at same location', () => {
      ship.hit('01');
      const result = ship.hit('01');
      expect(result).toBe(true);
      expect(ship.hits[1]).toBe(true);
    });
  });

  describe('isSunk', () => {
    test('should return false when ship is not hit', () => {
      expect(ship.isSunk()).toBe(false);
    });

    test('should return false when ship is partially hit', () => {
      ship.hit('00');
      ship.hit('01');
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true when all ship parts are hit', () => {
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      expect(ship.isSunk()).toBe(true);
    });

    test('should work correctly for single-length ship', () => {
      const singleShip = new Ship(1, ['55']);
      expect(singleShip.isSunk()).toBe(false);
      singleShip.hit('55');
      expect(singleShip.isSunk()).toBe(true);
    });
  });

  describe('isHitAtLocation', () => {
    test('should return false for unhit location on ship', () => {
      expect(ship.isHitAtLocation('01')).toBe(false);
    });

    test('should return true for hit location on ship', () => {
      ship.hit('01');
      expect(ship.isHitAtLocation('01')).toBe(true);
    });

    test('should return false for location not on ship', () => {
      expect(ship.isHitAtLocation('99')).toBe(false);
    });
  });

  describe('getUnhitLocations', () => {
    test('should return all locations when ship is unhit', () => {
      expect(ship.getUnhitLocations()).toEqual(['00', '01', '02']);
    });

    test('should return only unhit locations when partially hit', () => {
      ship.hit('01');
      expect(ship.getUnhitLocations()).toEqual(['00', '02']);
    });

    test('should return empty array when ship is sunk', () => {
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      expect(ship.getUnhitLocations()).toEqual([]);
    });
  });
}); 