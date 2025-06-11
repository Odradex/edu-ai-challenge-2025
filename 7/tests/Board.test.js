import { Board } from '../src/Board.js';

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board(true);
  });

  describe('constructor', () => {
    test('should create board with correct size', () => {
      expect(board.size).toBe(10);
      expect(board.showShips).toBe(true);
      expect(board.grid).toHaveLength(10);
      expect(board.ships).toEqual([]);
    });
  });

  describe('parseLocation', () => {
    test('should parse valid location', () => {
      const result = board.parseLocation('34');
      expect(result).toEqual({ row: 3, col: 4 });
    });

    test('should throw error for invalid format', () => {
      expect(() => board.parseLocation('1')).toThrow();
    });
  });

  describe('placeShip', () => {
    test('should place horizontal ship', () => {
      const ship = board.placeShip(3, 0, 0, 'horizontal');
      expect(ship).not.toBeNull();
      expect(ship.locations).toEqual(['00', '01', '02']);
    });

    test('should place vertical ship', () => {
      const ship = board.placeShip(3, 0, 0, 'vertical');
      expect(ship).not.toBeNull();
      expect(ship.locations).toEqual(['00', '10', '20']);
    });
  });

  describe('processGuess', () => {
    beforeEach(() => {
      board.placeShip(3, 0, 0, 'horizontal');
    });

    test('should process hit', () => {
      const result = board.processGuess('01');
      expect(result).toEqual({ hit: true, sunk: false, alreadyGuessed: false });
    });

    test('should process miss', () => {
      const result = board.processGuess('55');
      expect(result).toEqual({ hit: false, sunk: false, alreadyGuessed: false });
    });
  });
}); 