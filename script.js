const chessBoardEl = document.getElementById('chessBoard');
const promotionWhiteEl = document.getElementById('promotionWhite');
const promotionBlackEl = document.getElementById('promotionBlack');

promotionWhiteEl.querySelectorAll('.square').forEach((pieceEl) => {
  pieceEl.addEventListener('click', (e) => {
    console.log(e.currentTarget.getAttribute('type'));
  });
});

const htmlBoard = [];
const boardSize = 8; // squares
const boxSize = 80; // px

// Piece Types
const [PAWN, ROOK, KNIGHT, BISHOP, QUEEN, KING] = [
  'pawn',
  'rook',
  'knight',
  'bishop',
  'queen',
  'king',
];
// Piece colors
const [WHITE, BLACK] = ['white', 'black'];
// Special moves
const [EN_PASSANT, QUEENSIDE_CASTLING, KINGSIDE_CASTLING, PROMOTION] = [
  'enPassant',
  'queensideCastling',
  'kingsideCastling',
  'promotion',
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

const queenSideSquares = [getIdx(boardSize - 1, 3), getIdx(0, 3)];
const kingSideSquares = [getIdx(boardSize - 1, 5), getIdx(0, 5)];

let draggedPiece;
let isWhiteTurn;
let isPromoting;
let isChecking;
let blockedQueenSide;
let blockedKingSide;
let chessGame;

function startGame() {
  draggedPiece = null;
  isWhiteTurn = true;
  isChecking = false;
  blockedQueenSide = false;
  blockedKingSide = false;
  clearBoard();
  placePieces();

  collectPieces(WHITE, chessGame.board).forEach((idx) => {
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
  if ((color === WHITE) !== isWhiteTurn) return;
  const move = moves[to];

  if (!move) return; // illegal move

  isWhiteTurn = !isWhiteTurn;
  const { chess, capturedPiece, enemyLegalMovesMap, specialMove } = move;
  chessGame = chess;

  movePieceEl(x2, y2, pieceEl);
  moveSpecial(x2, y2, specialMove);

  console.table(chessGame.board);

  isChecking = false;
  collectPieces(color, chess.board).forEach((idx) =>
    computeMoves(idx, chessGame)
  ); // check if enemy king is checked

  if (isChecking) console.log('Check!!!');

  let hasMoves = false;

  for (const [idx, legalMoves] of Object.entries(enemyLegalMovesMap)) {
    const [x, y] = getCoor(idx);
    const eneyMoves = simulateMoves(idx, legalMoves, chessGame);
    chessGame.board[x][y].moves = eneyMoves;
    if (0 < Object.keys(eneyMoves).length) hasMoves = true;
  }

  if (!hasMoves) {
    if (isChecking) console.log('Checkmate!!!');
    else console.log('Stalemate lol');
  }
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
  const { board, enPassant } = chessCopy;
  const piece = board[x1][y1];
  let capturedPiece = board[x2][y2];
  let specialMove = null;
  board[x1][y1] = null;
  board[x2][y2] = piece;
  const { type, color } = piece;

  if (type === PAWN) {
    if (y1 !== y2 && !capturedPiece) {
      // En passant

      const [x, y] = getCoor(enPassant.pawnIdx);
      capturedPiece = board[x][y];
      board[x][y] = null;
      specialMove = { type: EN_PASSANT, pieceIdx: enPassant.pawnIdx };
    } else if (x2 === 0 || x2 === boardSize - 1) {
      // Promotion
      specialMove = { type: PROMOTION, pieceIdx: to };
    }
  } else if (type === KING) {
    if (y1 - 2 === y2) {
      // Queenside castling
      board[x1][y1 - 1] = board[x1][0];
      board[x1][0] = null;
      specialMove = { type: QUEENSIDE_CASTLING, pieceIdx: getIdx(x1, 0) };
    } else if (y1 + 2 === y2) {
      // Kingside castling
      board[x1][y1 + 1] = board[x1][boardSize - 1];
      board[x1][boardSize - 1] = null;
      specialMove = {
        type: KINGSIDE_CASTLING,
        pieceIdx: getIdx(x1, boardSize - 1),
      };
    }
  }
  chessCopy.enPassant = setEnPassant(from, to, board); // needs to be set before computing enemy moves

  isChecking = false;
  blockedQueenSide = false;
  blockedKingSide = false;
  const enemyPieces = collectPieces(color === WHITE ? BLACK : WHITE, board);
  const enemyLegalMovesMap = {};
  enemyPieces.forEach(
    (idx) => (enemyLegalMovesMap[idx] = computeMoves(idx, chessCopy))
  );
  if (
    isChecking ||
    (specialMove &&
      ((specialMove.type === QUEENSIDE_CASTLING && blockedQueenSide) ||
        (specialMove.type === KINGSIDE_CASTLING && blockedKingSide)))
  )
    return null; // move not valid

  piece.hasMoved = true;

  return {
    chess: chessCopy,
    capturedPiece,
    enemyLegalMovesMap, // {idx => [legalMoves]}
    specialMove,
  };
}

function setEnPassant(from, to, board) {
  const [x1, y1] = getCoor(from);
  const [x2, y2] = getCoor(to);
  const { type, color } = board[x2][y2];
  const dir = color === WHITE ? -1 : 1;
  return type === PAWN && y1 === y2 && x1 + dir * 2 === x2
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
      computeKingMoves(x, y, color, hasMoved, legalMoves, board);
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

function computeKingMoves(x, y, color, hasMoved, legalMoves, board) {
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (valid(i, j, color, board)) legalMoves.push(getIdx(i, j));
    }
  }
  if (!hasMoved) {
    // Queenside castling
    let piece = board[x][0];
    if (
      piece &&
      !piece.hasMoved &&
      piece.type === ROOK &&
      !board[x][1] &&
      !board[x][2] &&
      !board[x][3]
    )
      legalMoves.push(getIdx(x, y - 2));

    // Kingside castling
    piece = board[x][7];
    if (
      piece &&
      !piece.hasMoved &&
      piece.type === ROOK &&
      !board[x][5] &&
      !board[x][6]
    )
      legalMoves.push(getIdx(x, y + 2));
  }
}

// Checks if a piece of a color can move to a square
function valid(x, y, color, board) {
  if (x < 0 || boardSize <= x || y < 0 || boardSize <= y) return false;
  const piece = board[x][y];

  setChecks(x, y, color, piece);

  return !piece || (piece.type !== KING && piece.color !== color);
}

// Special check for pawn moving diagonally
function validPawn(x, y, color, board, enPassant) {
  if (x < 0 || boardSize <= x || y < 0 || boardSize <= y) return false;
  const piece = board[x][y];

  setChecks(x, y, color, piece);

  return (
    (piece && piece.type !== KING && piece.color !== color) ||
    (enPassant && enPassant.x === x && enPassant.y === y)
  );
}

function setChecks(x, y, color, target) {
  if (target && target.type === KING && target.color !== color)
    isChecking = true;

  const squareIdx = color === WHITE ? 1 : 0;
  if (queenSideSquares[squareIdx] === getIdx(x, y)) blockedQueenSide = true;
  if (kingSideSquares[squareIdx] === getIdx(x, y)) blockedKingSide = true;
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
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j]) {
        if (board[i][j].color === color) allyPieces.push(getIdx(i, j));
      }
    }
  }
  return allyPieces;
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

function movePieceEl(x, y, pieceEl) {
  const square = htmlBoard[x][y];
  square.innerHTML = '';
  square.appendChild(pieceEl);
  pieceEl.setAttribute('square', getIdx(x, y));
}

function moveSpecial(x2, y2, specialMove) {
  if (!specialMove) return;

  const { type, pieceIdx } = specialMove;
  const [x, y] = getCoor(pieceIdx);

  if (type === EN_PASSANT) {
    htmlBoard[x][y].innerHTML = '';
  } else if (type === QUEENSIDE_CASTLING) {
    const rookEl = htmlBoard[x][y].firstChild;
    movePieceEl(x2, y2 + 1, rookEl);
  } else if (type === KINGSIDE_CASTLING) {
    const rookEl = htmlBoard[x][y].firstChild;
    movePieceEl(x2, y2 - 1, rookEl);
  } else if (type === PROMOTION) {
    isPromoting = true;
    const promotionContainer = x === 0 ? promotionWhiteEl : promotionBlackEl;
    promotionContainer.classList.remove('hide');
    promotionContainer.style.left = boxSize * y - 3 + 'px';
  }
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
  const idx = pieceIdx(pieceEl);
  const [x, y] = getCoor(idx);
  const piece = chessGame.board[x][y];
  console.log(simulateMoves(idx, computeMoves(idx, chessGame), chessGame));
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
