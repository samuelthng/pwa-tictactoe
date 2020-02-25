import errors from "./errors.json";

import listeners from "./listeners";
export { listeners };

class TicTacToe {
  /** Rows of the board. */
  _rows;

  /** Columns of the board. */
  _cols;

  /** Size of the board. */
  _size;

  /** Board State */
  _board;

  /** Moves played */
  _moves = 0;

  /** X Marker */
  _markerX;

  /** O Marker */
  _markerO;

  /** Map of player identifier to marker. */
  _playerMap;

  _currentPlayer;

  _gameEnded;

  _winner = null;

  constructor(X = "X", O = "O", size = 3) {
    this._rows = size;
    this._cols = size;
    this._size = size;
    this._board = Array(size * size).fill(null);

    this._markerX = X;
    this._markerO = O;
    this._playerMap = {
      0: this._markerX,
      1: this._markerO
    };

    this._currentPlayer = Math.round(Math.random());
  }

  /**
   * @returns Board state.
   **/
  get board() {
    return this._board.map(s => this._playerMap[s] || null);
  }

  /**
   * @returns Current player.
   */
  get currentPlayer() {
    return this._currentPlayer;
  }

  get gameEnded() {
    return this._gameEnded || false;
  }

  get winner() {
    return this._winner;
  }

  checkWinningState(index) {
    const wins = [];

    // For any position, there will be horizontal or vertical win states.
    const row = this.getRowOf(index);
    wins.push(this.checkRowWin(row));

    const col = this.getColOf(index);
    wins.push(this.checkColWin(col));

    const leftToRightDiagonal = row === col;
    if (leftToRightDiagonal) {
      wins.push(this.checkLeftToRightWin());
    }

    const rightToLeftDiagonal = this.flipRow(row) === col;
    if (rightToLeftDiagonal) {
      wins.push(this.checkRightToLeftWin());
    }

    return wins.some(win => win === true);
  }

  flipRow(row) {
    return this._size - 1 - row;
  }

  getRowIndexes(row) {
    return [...Array(this._size)].map((_, i) => this.getIndexOf(row, i));
  }

  getColIndexes(col) {
    return [...Array(this._size)].map((_, i) => this.getIndexOf(i, col));
  }

  getLeftToRightIndexes() {
    return [...Array(this._size)].map((_, i) => this.getIndexOf(i, i));
  }

  getRightToLeftIndexes() {
    return [...Array(this._size)].map((_, i) =>
      this.getIndexOf(this.flipRow(i), i)
    );
  }
  checkRowWin(row) {
    return this.checkWinningIndexes(this.getRowIndexes(row));
  }

  checkColWin(col) {
    return this.checkWinningIndexes(this.getColIndexes(col));
  }

  checkLeftToRightWin() {
    return this.checkWinningIndexes(this.getLeftToRightIndexes());
  }

  checkRightToLeftWin() {
    return this.checkWinningIndexes(this.getRightToLeftIndexes());
  }

  checkWinningIndexes(indexes) {
    return indexes.map(i => this._board[i]).every((s, i, a) => s === a[0]);
  }

  /** Makes a play on a position. */
  selectPosition(index) {
    this.checkValidIndex(index);

    if (this._gameEnded) {
      throw Error(errors.position.ended);
    }

    if (this._board[index] !== null) {
      throw Error(errors.position.played);
    }

    this._moves++;
    this._board[index] = this.currentPlayer;
    this.updateBoardListeners();

    const hasWinner = this.checkWinningState(index);
    if (hasWinner) {
      this._winner = this.currentPlayer;
      this._gameEnded = true;
      this.updateGameEndedListeners();
      // console.log(
      //   `Game has ended, the winner: Player ${this.currentPlayer}, "${
      //     this._playerMap[this.currentPlayer]
      //   }"`
      // );
    } else if (this._moves === this._size * this._size) {
      this._gameEnded = true;
      this.updateGameEndedListeners();
      // console.log(`Game has ended with a draw!`);
    } else {
      this.togglePlayer();
      // console.log(`It is player: ${this._currentPlayer}'s turn.`);
    }
  }

  /** Swap between players and fire an update. */
  togglePlayer() {
    this._currentPlayer = Number(!Boolean(this._currentPlayer));
    this.updatePlayerListeners();
  }

  /** onBoardChanged Callbacks. */
  onBoardChanged = [];

  /** Fire callbacks for onBoardChanged. */
  updateBoardListeners(callback) {
    if (callback) callback(this.board);
    else this.onBoardChanged.forEach(fn => fn(this.board));
  }

  /** onPlayerChanged Callbacks. */
  onPlayerChanged = [];

  /** Fire callbacks for onPlayerChanged. */
  updatePlayerListeners(callback) {
    if (callback)
      callback(this.currentPlayer, this._playerMap[this.currentPlayer]);
    else
      this.onPlayerChanged.forEach(fn =>
        fn(this.currentPlayer, this._playerMap[this.currentPlayer])
      );
  }

  /** onGameEnded Callbacks. */
  onGameEnded = [];

  /** Fire callbacks for onGameEnded. */
  updateGameEndedListeners(callback) {
    if (callback)
      callback(
        this.gameEnded,
        this.winner,
        this._playerMap[this.winner] || null
      );
    else
      this.onGameEnded.forEach(fn =>
        fn(this.gameEnded, this.winner, this._playerMap[this.winner] || null)
      );
  }

  /** Registers an event listener.
   * @param event `onBoardChanged` | `onPlayerChanged` | `onGameEnded`
   * @param callback Function to be called on a change event.
   * @returns { function } Removes a callback function.
   */
  addListener(event, callback) {
    if (typeof event !== "symbol") throw TypeError(errors.listener.eventType);
    if (typeof callback !== "function")
      throw TypeError(errors.listener.callbackType);

    switch (event) {
      case listeners.onBoardChanged:
        this.onBoardChanged.push(callback);
        this.updateBoardListeners(callback);
        return () => {
          const index = this.onBoardChanged.findIndex(callback);
          this.onBoardChanged.splice(index, 1);
        };
      case listeners.onPlayerChanged:
        this.onPlayerChanged.push(callback);
        this.updatePlayerListeners(callback);
        return () => {
          const index = this.onPlayerChanged.findIndex(callback);
          this.onPlayerChanged.splice(index, 1);
        };
      case listeners.onGameEnded:
        this.onGameEnded.push(callback);
        this.updateGameEndedListeners(callback);
        return () => {
          const index = this.onGameEnded.findIndex(callback);
          this.onPlayerChanged.splice(index, 1);
        };
      default:
        return;
    }
  }

  /** Validates the index of a board position.
   * @param index Index of a board position.
   * @throws { RangeError } Index is out of board range.
   **/
  checkValidIndex(index) {
    if (index > this._board.length || index < 0) {
      throw RangeError(errors.validator.index);
    }
  }

  /** Validates the row of a board.
   * @param row Row of a board position.
   * @throws { RangeError } Row is out of board range.
   **/
  checkValidRow(row) {
    if (row < 0 || row > this._rows) {
      throw RangeError(errors.validator.row);
    }
  }

  /** Validates the column of a board.
   * @param col Column of a board position.
   * @throws { RangeError } Column is out of board range.
   **/
  checkValidCol(col) {
    if (col < 0 || col > this._cols) {
      throw RangeError(errors.validator.col);
    }
  }

  /** Returns the index of a given row and column positions of a board.
   * @param row Row of a board position.
   * @param col Column of a board position.
   * @returns { number } Index of a board position
   **/
  getIndexOf(row, col) {
    this.checkValidRow(row);
    this.checkValidCol(col);
    return row * this._rows + col;
  }

  /** Returns the row of a given index position of a board.
   * @param index Index of a board position.
   * @returns { number } Row of a board position.
   **/
  getRowOf(index) {
    this.checkValidIndex(index);
    return Math.floor(index / this._size);
  }

  /** Returns the column of a given index position of a board.
   * @param index Index of a board position.
   * @returns { number } Column of a board position.
   **/
  getColOf(index) {
    this.checkValidIndex(index);
    return index % this._size;
  }
}

export default TicTacToe;
