# Sea Battle (Refactored)

A modern, refactored version of the classic Battleship game, built with ES6+ JavaScript featuring clean architecture, comprehensive testing, and maintainable code.

## 🚀 Features

- **Modern JavaScript**: Built with ES6+ features including classes, modules, async/await
- **Clean Architecture**: Modular design with clear separation of concerns
- **Comprehensive Testing**: 83.5% test coverage with Jest
- **Smart AI**: CPU opponent with hunt and target modes
- **Error Handling**: Robust input validation and error recovery
- **Extensible**: Easy to modify and extend

## 📁 Project Structure

```
7/
├── src/
│   ├── Ship.js          # Ship class with hit detection
│   ├── Board.js         # Board management and validation
│   ├── Player.js        # Human and CPU player classes
│   ├── Game.js          # Main game orchestrator
│   ├── GameUI.js        # User interface handling
│   └── index.js         # Application entry point
├── tests/
│   ├── Ship.test.js     # Ship class tests
│   ├── Board.test.js    # Board class tests
│   ├── Player.test.js   # Player classes tests
│   └── Game.test.js     # Game class tests
├── package.json         # Dependencies and scripts
├── .babelrc            # Babel configuration
├── refactoring.md      # Detailed refactoring documentation
├── test_report.txt     # Test coverage report
└── README.md           # This file
```

## 🎮 How to Play

1. **Game Board**: 10x10 grid with coordinates from 00 to 99
2. **Ships**: 3 ships of length 3 are randomly placed on each board
3. **Objective**: Sink all enemy ships before the CPU sinks yours
4. **Input**: Enter coordinates as two digits (e.g., "34" for row 3, column 4)
5. **Symbols**:
   - `~` = Water
   - `S` = Your ship
   - `X` = Hit
   - `O` = Miss

## 🛠 Installation & Setup

Since this is a Node.js application, you'll need Node.js and npm installed:

```bash
# Clone or download the project
cd 7

# Install dependencies
npm install

# Run the game
npm start

# Run tests
npm test

# Generate coverage report
npm run test:coverage
```

## 🎯 Game Rules

1. **Setup**: Ships are automatically placed randomly on both boards
2. **Turns**: You go first, then the CPU alternates
3. **Guessing**: Enter coordinates like "00", "34", "99"
4. **Feedback**: Get immediate feedback on hits, misses, and sunk ships
5. **Victory**: First to sink all opponent ships wins

## 🤖 CPU AI Behavior

The CPU opponent uses two intelligent modes:

- **Hunt Mode**: Random targeting to find ships
- **Target Mode**: When a ship is hit, targets adjacent squares systematically

## 🧪 Testing

The application includes comprehensive unit tests:

- **47 test cases** covering all major functionality
- **83.5% code coverage** (exceeds 60% requirement)
- **Jest framework** with mocking for UI components
- **Continuous integration ready**

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate detailed coverage report
npm run test:coverage
```

## 🏗 Architecture

### Core Classes

- **Ship**: Manages individual ships, hit detection, and sinking
- **Board**: Handles the game board, ship placement, and guess processing
- **Player**: Base class for human and CPU players
- **HumanPlayer**: Handles input validation for human players
- **CPUPlayer**: Implements AI strategy for computer opponent
- **Game**: Main orchestrator managing game flow and state
- **GameUI**: Separated UI concerns for display and input

### Design Patterns

- **Object-Oriented Programming**: Classes with encapsulated state and behavior
- **Single Responsibility Principle**: Each class has one clear purpose
- **Dependency Injection**: Components receive dependencies rather than creating them
- **Strategy Pattern**: Different AI behaviors encapsulated in methods

## ⚡ Performance Features

- **Efficient Data Structures**: Uses `Set` for O(1) guess lookups
- **Optimized Algorithms**: Smart ship placement and AI targeting
- **Memory Management**: No global variables or memory leaks
- **Error Recovery**: Graceful handling of edge cases

## 🔧 Configuration

The game supports customization through the Game constructor:

```javascript
const game = new Game({
  boardSize: 10,    // Board size (default: 10)
  numShips: 3,      // Number of ships (default: 3)
  shipLength: 3     // Length of each ship (default: 3)
});
```

## 🤝 Contributing

This refactored version makes it easy to contribute:

1. **Add New Features**: Clean modular structure
2. **Modify AI**: CPU behavior is encapsulated and extensible
3. **Change UI**: UI logic is separated from game logic
4. **Add Ship Types**: Ship class supports different configurations

## 📊 Improvements from Original

### Code Quality
- ✅ Modern ES6+ JavaScript (from legacy `var` syntax)
- ✅ Modular architecture (from 333-line monolith)
- ✅ No global variables (from 15+ globals)
- ✅ Comprehensive error handling
- ✅ Full JSDoc documentation

### Testing
- ✅ 47 unit tests (from no tests)
- ✅ 83.5% code coverage
- ✅ Automated testing with Jest
- ✅ Mocked dependencies for isolated testing

### Maintainability
- ✅ Single responsibility classes
- ✅ Clear separation of concerns
- ✅ Extensible and configurable
- ✅ Consistent naming conventions

## 📈 Performance

The refactored version includes several performance improvements:

- **Faster ship placement**: Optimized algorithms with fallback strategies
- **Efficient guess tracking**: Set-based storage for O(1) lookups
- **Smart CPU AI**: Reduced random guessing with intelligent targeting
- **Memory efficient**: Proper cleanup and no memory leaks

## 🐛 Error Handling

Robust error handling throughout:

- **Input Validation**: Comprehensive validation with clear error messages
- **Boundary Checking**: All coordinates validated before processing
- **Graceful Failures**: Game continues even with invalid inputs
- **Recovery Mechanisms**: Automatic fallbacks for edge cases

## 📝 License

This refactored version maintains the educational purpose of the original code while demonstrating modern JavaScript best practices and testing methodologies.

---

**Original Legacy Code**: 333 lines, no tests, global variables
**Refactored Modern Code**: Modular architecture, 83.5% test coverage, production-ready

Enjoy the game! 🎮 