/**
 * Represents a ship in the Sea Battle game
 */
export class Ship {
  /**
   * Create a ship
   * @param {number} length - The length of the ship
   * @param {Array<string>} locations - Array of location strings (e.g., ['00', '01', '02'])
   */
  constructor(length, locations = []) {
    this.length = length;
    this.locations = [...locations];
    this.hits = new Array(length).fill(false);
  }

  /**
   * Check if the ship is hit at a specific location
   * @param {string} location - The location to check (e.g., '34')
   * @returns {boolean} True if the ship is at this location
   */
  isAtLocation(location) {
    return this.locations.includes(location);
  }

  /**
   * Hit the ship at a specific location
   * @param {string} location - The location to hit
   * @returns {boolean} True if hit was successful, false if location not on ship
   */
  hit(location) {
    const index = this.locations.indexOf(location);
    if (index === -1) {
      return false;
    }
    this.hits[index] = true;
    return true;
  }

  /**
   * Check if the ship is completely sunk
   * @returns {boolean} True if all parts of the ship are hit
   */
  isSunk() {
    return this.hits.every(hit => hit === true);
  }

  /**
   * Check if a specific location on the ship has been hit
   * @param {string} location - The location to check
   * @returns {boolean} True if this location has been hit
   */
  isHitAtLocation(location) {
    const index = this.locations.indexOf(location);
    return index !== -1 && this.hits[index];
  }

  /**
   * Get all unhit locations of the ship
   * @returns {Array<string>} Array of unhit locations
   */
  getUnhitLocations() {
    return this.locations.filter((location, index) => !this.hits[index]);
  }
} 