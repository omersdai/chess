const chessBoardEl = document.getElementById('chessBoard');

const htmlBoard = [];
const boardSize = 8;
const [PAWN, ROOK, KNIGHT, BISHOP, QUEEN, KING, WHITE, BLACK] = [
  'pawn',
  'rook',
  'knight',
  'bishop',
  'queen',
  'king',
  'white',
  'black',
];

const PAWN_HTML = '<i class="fa-solid fa-chess-pawn" draggable="true"></i>';
const ROOK_HTML = '<i class="fa-solid fa-chess-rook" draggable="true"></i>';
const KNIGHT_HTML = '<i class="fa-solid fa-chess-knight" draggable="true"></i>';
const BISHOP_HTML = '<i class="fa-solid fa-chess-bishop" draggable="true"></i>';
const QUEEN_HTML = '<i class="fa-solid fa-chess-queen" draggable="true"></i>';
const KING_HTML = '<i class="fa-solid fa-chess-king" draggable="true"></i>';

const iconMap = {
  [PAWN]: PAWN_HTML,
  [ROOK]: ROOK_HTML,
  [KNIGHT]: KNIGHT_HTML,
  [BISHOP]: BISHOP_HTML,
  [QUEEN]: QUEEN_HTML,
  [KING]: KING_HTML,
};

let draggedPiece;
let isWhiteTurn;
let isChecking;
let chessGame;

function startGame() {
  draggedPiece = null;
  isWhiteTurn = true;
  isChecking = false;
  clearBoard();
  placePieces();
  const whitePieces = collectPieces(WHITE, chessGame.board)[0];

  whitePieces.forEach((idx) => {
    const legalMoves = computeMoves(idx, chessGame);
    const [x, y] = getCoor(idx);
    chessGame.board[x][y].moves = simulateMoves(idx, legalMoves, chessGame);
  });
}

function movePiece(pieceEl, to) {
  const from = pieceIdx(pieceEl);
  const [x1, y1] = getCoor(from);
  const [x2, y2] = getCoor(to);
  const { board } = chessGame;
  const { color, moves } = board[x1][y1];
  if ((color === WHITE) === isWhiteTurn) return;
  const move = moves[to];

  if (!move) return; // illegal move

  isWhiteTurn = !isWhiteTurn;
  chessGame = move.chess;
  chessGame.board[x2][y2].hasMoved = true;
  const { check, capturedPiece, enemyMoves } = move;
  console.log(from, to, check, capturedPiece, chessGame.enPassant);

  for (const [idx, legalMoves] of Object.entries(enemyMoves)) {
    const [x, y] = getCoor(idx);
    chessGame.board[x][y].moves = simulateMoves(idx, legalMoves, chessGame);
  }

  const square = htmlBoard[x2][y2];
  square.innerHTML = '';
  square.appendChild(pieceEl);
  pieceEl.setAttribute('square', to);
  console.log(chessGame);
}

function simulateMoves(idx, legalMoves, chess) {
  const moves = {};
  legalMoves.forEach((to) => {
    const move = simulateMove(idx, to, chess);
    if (move) moves[to] = move;
  });

  return moves;
}

// Checks if your king is undefended after making a move
function simulateMove(from, to, chess) {
  const [x1, y1] = getCoor(from);
  const [x2, y2] = getCoor(to);
  const chessCopy = copyChess(chess);
  const { board } = chessCopy;
  chessCopy.enPassant = setEnPassant(from, to, board);
  const piece = board[x1][y1];
  const capturedPiece = board[x2][y2];
  board[x1][y1] = null;
  board[x2][y2] = piece;
  // TODO: CHECK SPECIAL MOVES LIKE EN PASSANT OR CASTLE
  const [allyPieces, enemyPieces] = collectPieces(piece.color, board);

  isChecking = false;
  const enemyMoves = {};
  enemyPieces.forEach(
    (idx) => (enemyMoves[idx] = computeMoves(idx, chessCopy))
  );
  if (isChecking) return null; // move not valid

  isChecking = false;
  allyPieces.forEach((idx) => computeMoves(idx, chessCopy)); // check if enemy king is checked

  return {
    check: isChecking, // checking enemy king
    chess: chessCopy,
    capturedPiece,
    enemyMoves, // {idx => [legalMoves]}
  };
}

function setEnPassant(from, to, board) {
  const [x1, y1] = getCoor(from);
  const [x2, y2] = getCoor(to);
  const { type, color, hasMoved } = board[x1][y1];
  const dir = color === WHITE ? -1 : 1;
  return type === PAWN && !hasMoved && y1 === y2 && x1 + dir * 2 === x2
    ? { x: x1 + dir, y: y1, pawnIdx: to }
    : null;
}

// Computes possible legal moves for a chess piece
function computeMoves(idx, chess) {
  const [x, y] = getCoor(idx);
  const { board, enPassant } = chess;
  const piece = board[x][y];
  if (!piece) throw 'No piece to compute moves!';
  const { type, color, hasMoved } = piece;
  const legalMoves = [];

  switch (type) {
    case PAWN:
      computePawnMoves(x, y, color, hasMoved, legalMoves, board, enPassant);
      break;
    case ROOK:
      computeRookMoves(x, y, color, legalMoves, board);
      break;
    case KNIGHT:
      computeKnightMoves(x, y, color, legalMoves, board);
      break;
    case BISHOP:
      computeBishopMoves(x, y, color, legalMoves, board);
      break;
    case QUEEN:
      computeRookMoves(x, y, color, legalMoves, board);
      computeBishopMoves(x, y, color, legalMoves, board);
      break;
    case KING:
      computeKingMoves(x, y, color, legalMoves, board);
      break;
  }

  return legalMoves;
}

function computePawnMoves(x, y, color, hasMoved, legalMoves, board, enPassant) {
  const dir = color === WHITE ? -1 : 1;
  // Single jump
  if (!board[x + dir][y]) {
    legalMoves.push(getIdx(x + dir, y));
    // Double jump
    if (!hasMoved && !board[x + dir * 2][y])
      legalMoves.push(getIdx(x + dir * 2, y));
  }

  // Check diagonals
  if (validPawn(x + dir, y - 1, color, board, enPassant))
    legalMoves.push(getIdx(x + dir, y - 1));
  if (validPawn(x + dir, y + 1, color, board, enPassant))
    legalMoves.push(getIdx(x + dir, y + 1));
}

function computeRookMoves(x, y, color, legalMoves, board) {
  // Go Down
  for (let i = x + 1; i < boardSize; i++) {
    if (valid(i, y, color, board)) {
      legalMoves.push(getIdx(i, y));
      if (board[i][y]) break;
    } else {
      break;
    }
  }
  // Go Right
  for (let i = y + 1; i < boardSize; i++) {
    if (valid(x, i, color, board)) {
      legalMoves.push(getIdx(x, i));
      if (board[x][i]) break;
    } else {
      break;
    }
  }
  // Go Up
  for (let i = x - 1; i >= 0; i--) {
    if (valid(i, y, color, board)) {
      legalMoves.push(getIdx(i, y));
      if (board[i][y]) break;
    } else {
      break;
    }
  }
  // Go Left
  for (let i = y - 1; i >= 0; i--) {
    if (valid(x, i, color, board)) {
      legalMoves.push(getIdx(x, i));
      if (board[x][i]) break;
    } else {
      break;
    }
  }
}

function computeKnightMoves(x, y, color, legalMoves, board) {
  if (valid(x + 2, y + 1, color, board)) legalMoves.push(getIdx(x + 2, y + 1));
  if (valid(x + 2, y - 1, color, board)) legalMoves.push(getIdx(x + 2, y - 1));
  if (valid(x - 2, y + 1, color, board)) legalMoves.push(getIdx(x - 2, y + 1));
  if (valid(x - 2, y - 1, color, board)) legalMoves.push(getIdx(x - 2, y - 1));
  if (valid(x + 1, y + 2, color, board)) legalMoves.push(getIdx(x + 1, y + 2));
  if (valid(x - 1, y + 2, color, board)) legalMoves.push(getIdx(x - 1, y + 2));
  if (valid(x + 1, y - 2, color, board)) legalMoves.push(getIdx(x + 1, y - 2));
  if (valid(x - 1, y - 2, color, board)) legalMoves.push(getIdx(x - 1, y - 2));
}

function computeBishopMoves(x, y, color, legalMoves, board) {
  // Down Right
  for (let i = 1; i < boardSize; i++) {
    if (valid(x + i, y + i, color, board)) {
      legalMoves.push(getIdx(x + i, y + i));
      if (board[x + i][y + i]) break;
    } else {
      break;
    }
  }
  // Down Left
  for (let i = 1; i < boardSize; i++) {
    if (valid(x + i, y - i, color, board)) {
      legalMoves.push(getIdx(x + i, y - i));
      if (board[x + i][y - i]) break;
    } else {
      break;
    }
  }
  // Up Right
  for (let i = 1; i < boardSize; i++) {
    if (valid(x - i, y + i, color, board)) {
      legalMoves.push(getIdx(x - i, y + i));
      if (board[x - i][y + i]) break;
    } else {
      break;
    }
  }
  // Up Left
  for (let i = 1; i < boardSize; i++) {
    if (valid(x - i, y - i, color, board)) {
      legalMoves.push(getIdx(x - i, y - i));
      if (board[x - i][y - i]) break;
    } else {
      break;
    }
  }
}

function computeKingMoves(x, y, color, legalMoves, board) {
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (valid(i, j, color, board)) legalMoves.push(getIdx(i, j));
    }
  }
  // TODO code rook making
}

// Checks if a piece of a color can move to a square, stores isChecking
function valid(x, y, color, board) {
  if (x < 0 || boardSize <= x || y < 0 || boardSize <= y) return false;
  const piece = board[x][y];
  if (piece && piece.type === KING && piece.color !== color) isChecking = true;
  return !piece || (piece.type !== KING && piece.color !== color);
}

// Special check for pawn moving diagonally, stores isChecking
function validPawn(x, y, color, board, enPassant) {
  if (x < 0 || boardSize <= x || y < 0 || boardSize <= y) return false;
  const piece = board[x][y];

  if (piece && piece.type === KING && piece.color !== color) isChecking = true;
  return (
    (piece && piece.type !== KING && piece.color !== color) ||
    (enPassant && enPassant.x === x && enPassant.y === y)
  );
}

function createPiece(x, y, type, color) {
  const piece = {
    type,
    color,
    hasMoved: false,
    moves: null,
  };
  chessGame.board[x][y] = piece;

  const square = htmlBoard[x][y];
  square.innerHTML = iconMap[type];
  const pieceEl = square.firstChild;
  pieceEl.style.color = color;
  pieceEl.setAttribute('square', getIdx(x, y));
  pieceEl.setAttribute('type', type);
  pieceEl.setAttribute('color', color);
  pieceEl.addEventListener('dragstart', dragStart);
  pieceEl.addEventListener('dragend', dragEnd);
  pieceEl.addEventListener('click', onClick); // for debugging
}

function collectPieces(color, board) {
  const allyPieces = [];
  const enemyPieces = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j]) {
        if (board[i][j].color === color) allyPieces.push(getIdx(i, j));
        else enemyPieces.push(getIdx(i, j));
      }
    }
  }
  return [allyPieces, enemyPieces];
}

function clearBoard() {
  const board = [];
  for (let i = 0; i < boardSize; i++) {
    const arr = [];
    for (let j = 0; j < boardSize; j++) {
      htmlBoard[i][j].innerHTML = '';
      arr.push(null);
    }
    board.push(arr);
  }
  chessGame = { board, enPassant: null };
}

function placePieces() {
  for (let i = 0; i < boardSize; i++) {
    createPiece(1, i, PAWN, BLACK);
    createPiece(6, i, PAWN, WHITE);
  }

  createPiece(0, 0, ROOK, BLACK);
  createPiece(0, 7, ROOK, BLACK);
  createPiece(7, 0, ROOK, WHITE);
  createPiece(7, 7, ROOK, WHITE);

  createPiece(0, 1, KNIGHT, BLACK);
  createPiece(0, 6, KNIGHT, BLACK);
  createPiece(7, 1, KNIGHT, WHITE);
  createPiece(7, 6, KNIGHT, WHITE);

  createPiece(0, 2, BISHOP, BLACK);
  createPiece(0, 5, BISHOP, BLACK);
  createPiece(7, 2, BISHOP, WHITE);
  createPiece(7, 5, BISHOP, WHITE);

  createPiece(0, 3, QUEEN, BLACK);
  createPiece(0, 4, KING, BLACK);

  createPiece(7, 3, QUEEN, WHITE);
  createPiece(7, 4, KING, WHITE);
}

function initiliazeGame() {
  for (const row of chessBoardEl.querySelectorAll('.row')) {
    const arr = [];
    for (const square of row.querySelectorAll('.square')) {
      arr.push(square);
    }
    htmlBoard.push(arr);
  }
  startGame();
}

//////////////////
// Event Listeners
//////////////////
function dragStart(e) {
  draggedPiece = e.currentTarget;
}

function dragEnd(e) {
  draggedPiece = null;
}

// For debugging purposes, remove later
function onClick(e) {
  const pieceEl = e.currentTarget;
  const [x, y] = getCoor(pieceIdx(pieceEl));
  const piece = chessGame.board[x][y];
  console.log(computeMoves(pieceIdx(pieceEl), chessGame));
}

chessBoardEl.querySelectorAll('.square').forEach((square, idx) => {
  square.addEventListener('dragenter', (e) => {
    if (!draggedPiece) return;
    e.currentTarget.classList.add('hover');
  });

  square.addEventListener('dragleave', (e) => {
    if (!draggedPiece) return;
    e.currentTarget.classList.remove('hover');
  });

  square.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!draggedPiece) return;
    e.currentTarget.classList.remove('hover');

    movePiece(draggedPiece, idx);
  });

  // Dragging is not enabled by default
  square.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
});

function printBoard() {
  for (const row of chessGame.board) {
    console.log(row.map((piece) => (piece ? piece.type : 'null')));
  }
}

function copyChess(chess) {
  const { board, enPassant } = chess;
  const boardCopy = [];
  for (let i = 0; i < boardSize; i++) {
    const arr = [];
    for (let j = 0; j < boardSize; j++) {
      arr.push(board[i][j] ? { ...board[i][j] } : null);
    }
    boardCopy.push(arr);
  }

  return { board: boardCopy, enPassant: enPassant ? { ...enPassant } : null };
}

function pieceIdx(pieceEl) {
  return parseInt(pieceEl.getAttribute('square'));
}

function getCoor(idx) {
  const x = parseInt(idx / boardSize);
  const y = idx % boardSize;
  return [x, y];
}

function getIdx(x, y) {
  return x * boardSize + y;
}

initiliazeGame();
