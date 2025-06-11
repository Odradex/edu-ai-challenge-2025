import { Player, HumanPlayer, CPUPlayer } from '../src/Player.js';
import { Board } from '../src/Board.js';

describe('Player', () => {
  let player;

  beforeEach(() => {
    player = new Player('TestPlayer', true);
  });

  describe('constructor', () => {
    test('should create player with correct properties', () => {
      expect(player.name).toBe('TestPlayer');
      expect(player.isHuman).toBe(true);
      expect(player.board).toBeInstanceOf(Board);
    });
  });

  describe('setupShips', () => {
    test('should setup ships successfully', () => {
      const result = player.setupShips(3, 3);
      expect(result).toBe(true);
      expect(player.board.ships).toHaveLength(3);
    });
  });

  describe('getShipsRemaining', () => {
    test('should return correct ship count', () => {
      player.setupShips(2, 2);
      expect(player.getShipsRemaining()).toBe(2);
    });
  });

  describe('receiveAttack', () => {
    beforeEach(() => {
      player.board.placeShip(3, 0, 0, 'horizontal');
    });

    test('should process attack correctly', () => {
      const result = player.receiveAttack('01');
      expect(result.hit).toBe(true);
    });
  });
});

describe('HumanPlayer', () => {
  let humanPlayer;

  beforeEach(() => {
    humanPlayer = new HumanPlayer();
  });

  describe('constructor', () => {
    test('should create human player', () => {
      expect(humanPlayer.name).toBe('Player');
      expect(humanPlayer.isHuman).toBe(true);
    });
  });

  describe('validateGuess', () => {
    test('should validate correct input', () => {
      const result = humanPlayer.validateGuess('34');
      expect(result.valid).toBe(true);
      expect(result.location).toBe('34');
    });

    test('should reject invalid input length', () => {
      const result = humanPlayer.validateGuess('1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exactly two digits');
    });

    test('should reject non-numeric input', () => {
      const result = humanPlayer.validateGuess('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('only digits');
    });

    test('should reject out of bounds coordinates', () => {
      const result = humanPlayer.validateGuess('aa');
      expect(result.valid).toBe(false);
    });

    test('should reject null input', () => {
      const result = humanPlayer.validateGuess(null);
      expect(result.valid).toBe(false);
    });
  });
});

describe('CPUPlayer', () => {
  let cpuPlayer;
  let opponentBoard;

  beforeEach(() => {
    cpuPlayer = new CPUPlayer();
    opponentBoard = new Board(true);
    opponentBoard.placeShip(3, 0, 0, 'horizontal'); // Ship at 00, 01, 02
    cpuPlayer.setOpponentBoard(opponentBoard);
  });

  describe('constructor', () => {
    test('should create CPU player', () => {
      expect(cpuPlayer.name).toBe('CPU');
      expect(cpuPlayer.isHuman).toBe(false);
      expect(cpuPlayer.mode).toBe('hunt');
      expect(cpuPlayer.targetQueue).toEqual([]);
    });
  });

  describe('makeGuess', () => {
    test('should make valid guess', () => {
      const guess = cpuPlayer.makeGuess();
      expect(guess).toMatch(/^[0-9][0-9]$/);
    });

    test('should throw error without opponent board', () => {
      const newCpu = new CPUPlayer();
      expect(() => newCpu.makeGuess()).toThrow('Opponent board not set');
    });
  });

  describe('processGuessResult', () => {
    test('should switch to target mode on hit', () => {
      const result = { hit: true, sunk: false, alreadyGuessed: false };
      cpuPlayer.processGuessResult('01', result);
      expect(cpuPlayer.mode).toBe('target');
      expect(cpuPlayer.targetQueue.length).toBeGreaterThan(0);
    });

    test('should switch to hunt mode on sunk', () => {
      cpuPlayer.mode = 'target';
      cpuPlayer.targetQueue = ['00', '01'];
      const result = { hit: true, sunk: true, alreadyGuessed: false };
      cpuPlayer.processGuessResult('02', result);
      expect(cpuPlayer.mode).toBe('hunt');
      expect(cpuPlayer.targetQueue).toEqual([]);
    });

    test('should maintain mode on miss', () => {
      const originalMode = cpuPlayer.mode;
      const result = { hit: false, sunk: false, alreadyGuessed: false };
      cpuPlayer.processGuessResult('99', result);
      expect(cpuPlayer.mode).toBe(originalMode);
    });
  });

  describe('makeRandomGuess', () => {
    test('should make valid random guess', () => {
      const guess = cpuPlayer.makeRandomGuess();
      expect(guess).toMatch(/^[0-9][0-9]$/);
      const { row, col } = opponentBoard.parseLocation(guess);
      expect(opponentBoard.isValidCoordinate(row, col)).toBe(true);
    });
  });
}); 