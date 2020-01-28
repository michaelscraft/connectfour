/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */
const table = document.querySelector('#board');
const modal = document.querySelector('.modal');
const form = document.querySelector('#gameConfigForm');

let WIDTH;
let HEIGHT;

let currPlayer = 1; // active player: 1 or 2
let board = []; // array of rows, each row is array of cells  (board[y][x])
let gameOver = false;

// UTIL
const flatten = (arr) => arr.reduce((acc, curr) => acc.concat(Array.isArray(curr) ? flatten(curr) : curr), []);
// END UTIL

/** checkForWin: check board cell-by-cell for "does a win start here?" */
const checkForWin = () => {
  // Check four cells to see if they're all color of current player
  //  - cells: list of four (y, x) cells
  //  - returns true if all are legal coordinates & all match currPlayer

  const _win = (cells) => cells.every( // check horiz and vert values
    ([y, x]) => y >= 0
        && y < HEIGHT
        && x >= 0
        && x < WIDTH
        && board[y][x] === currPlayer,
  );

  for (let y = 0; y < HEIGHT; y++) { // check diag values
    for (let x = 0; x < WIDTH; x++) {
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
  return false;
};

const checkForTie = () => {
  // flatten board arr;
  const flattenBoard = flatten(board);
  // return arr with "null" vals from flattenBoard;
  const checkForNull = flattenBoard.filter((val) => val === null);

  return checkForNull.length === 0;
};

/** findSpotForCol: given column x, returs top empty y (null if filled) */
const findSpotForCol = (x) => {
  const trs = [...document.querySelectorAll('#board tr')];
  // creating an arr of from column "X"
  const spots = trs.map((tr) => tr.cells[x]);
  // creating arr of empty TDs;
  const emptySpot = spots.filter((spot) => spot.children.length === 0);

  return emptySpot.length - 1 || null;
};

/** placeInTable: update DOM to place piece into HTML table of board */
function placeInTable(y, x) {
  const trs = [...document.querySelectorAll('#board tr')];
  const emptySpot = trs[y].cells[x]; // getting empty cell using x y coordinates;
  const div = document.createElement('div');

  if (currPlayer === 1) {
    div.classList.add('player1');
    emptySpot.append(div);
  } else {
    div.classList.add('player2');
    emptySpot.append(div);
  }
  board[y - 1][x] = currPlayer;
}

/** endGame: announce game end */
const endGame = (msg) => {
  gameOver = true;
  setTimeout(() => {
    alert(`${msg}`);
    table.innerHTML = '';
    modal.classList.toggle('hide');
  }, 0);
};

/** handleClick: handle click of column top to play piece */
const handleClick = (evt) => {
  const x = evt.target.id; // get x from ID of clicked cell
  const y = findSpotForCol(x); // get next spot in column (if none, ignore click)

  if (y === null || gameOver) return;

  placeInTable(y, x);
  // check for win
  if (checkForWin()) endGame(`Player ${currPlayer} won!`);

  // check for tie
  if (checkForTie()) endGame('Its a tie');

  // switch players
  if (currPlayer === 1) {
    currPlayer = 2;
  } else {
    currPlayer = 1;
  }
};

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

const makeBoard = (height, width) => {
  const boardMatrix = [];

  for (let i = 0; i < height; i++) { // creating matrix rows
    boardMatrix.push([]);
  }

  boardMatrix.forEach((arr) => { // creating matrix columns
    for (let i = 0; i < width; i++) {
      arr.push(null);
    }
  });

  board = boardMatrix;
};

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  const htmlBoard = document.querySelector('#board'); // selecting table id 'board'
  const top = document.createElement('tr'); // creating top table row

  top.setAttribute('id', 'column-top'); // assigning id 'column-top' to top row
  top.addEventListener('click', handleClick); // adding event listner to top row

  // creating top row (buttons) HTML
  for (let x = 0; x < WIDTH; x++) { // creating columns for top row;
    const headCell = document.createElement('td');
    headCell.setAttribute('id', x);
    top.append(headCell);
  }
  htmlBoard.append(top); // appending top row to our board
  // creating game board HTML
  for (let y = 0; y < HEIGHT; y++) { // creating table rows
    const row = document.createElement('tr');
    for (let x = 0; x < WIDTH; x++) { // creating table columns
      const cell = document.createElement('td');
      cell.setAttribute('id', `${y}-${x}`); // assigning unique id to each cell
      row.append(cell);
    }
    htmlBoard.append(row); // appending game board HTML to table
  }
}

const setFieldSize = (size) => {
  if (size === 'small') {
    WIDTH = 4;
    HEIGHT = 4;
  } else if (size === 'medium') {
    WIDTH = 6;
    HEIGHT = 6;
  } else {
    WIDTH = 8;
    HEIGHT = 8;
  }
};

const handleSubmit = (e) => {
  e.preventDefault();
  const size = e.target.size.value;
  gameOver = false;
  currPlayer = 1;
  board = [];

  modal.classList.toggle('hide');
  setFieldSize(size);
  makeBoard(HEIGHT, WIDTH);
  makeHtmlBoard();
};

form.addEventListener('submit', handleSubmit);
