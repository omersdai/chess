const chessBoardEl = document.getElementById('chessBoard');

const PAWN_HTML = '<i class="fa-solid fa-chess-pawn" draggable="true"></i>';
const ROOK_HTML = '<i class="fa-solid fa-chess-rook" draggable="true"></i>';
const KNIGHT_HTML = '<i class="fa-solid fa-chess-knight" draggable="true"></i>';
const BISHOP_HTML = '<i class="fa-solid fa-chess-bishop" draggable="true"></i>';
const QUEEN_HTML = '<i class="fa-solid fa-chess-queen" draggable="true"></i>';
const KING_HTML = '<i class="fa-solid fa-chess-king" draggable="true"></i>';

const chessBoard = [];
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

const iconMap = {
  [PAWN]: PAWN_HTML,
  [ROOK]: ROOK_HTML,
  [KNIGHT]: KNIGHT_HTML,
  [BISHOP]: BISHOP_HTML,
  [QUEEN]: QUEEN_HTML,
  [KING]: KING_HTML,
};

let draggedPiece;
let enPassant;
let isWhiteTurn;
let chess;

function startGame() {
  draggedPiece = null;
  enPassant = null;
  isWhiteTurn = true;
  clearBoard();
  placePieces();
}

function movePiece(pieceEl, x2, y2) {
  const x1 = parseInt(pieceEl.getAttribute('row'));
  const y1 = parseInt(pieceEl.getAttribute('col'));

  if (!isLegalMove(x1, y1, x2, y2)) return;

  setEnPassant(x1, y1, x2, y2);

  const piece = chess[x1][y1];
  capturePiece(x2, y2);
  piece.hasMoved = true;
  chess[x1][y1] = null;
  chess[x2][y2] = piece;
  isWhiteTurn = !isWhiteTurn;

  const square = chessBoard[x2][y2];
  square.innerHTML = '';
  square.appendChild(pieceEl);

  pieceEl.setAttribute('row', x2);
  pieceEl.setAttribute('col', y2);

  printBoard();
}

function capturePiece(x, y) {
  chess[x][y] = null;
  const piece = chessBoard[x][y].firstChild;
  if (piece) piece.remove();
}

function isLegalMove(x1, y1, x2, y2) {
  const piece = chess[x1][y1];
  const targetPiece = chess[x2][y2];
  const { type, color, hasMoved } = piece;

  if (
    // (color === WHITE) !== isWhiteTurn ||
    (x1 === x2 && y1 === y2) ||
    (targetPiece && (targetPiece.type === KING || targetPiece.color === color))
  )
    return false;

  switch (type) {
    case PAWN:
      const dir = color === WHITE ? -1 : 1;
      if (!targetPiece && y1 === y2) {
        // Single jump
        if (x1 + dir === x2) return true;
        // Double jump
        if (!hasMoved && !chess[x1 + dir][y2] && x1 + dir * 2 === x2)
          return true;
      }

      // Check diagonals
      if (x1 + dir === x2 && (y1 - 1 === y2 || y1 + 1 === y2)) {
        if (targetPiece) return true;
        if (enPassant && enPassant.x === x2 && enPassant.y === y2) {
          capturePiece(enPassant.pawnCoor[0], enPassant.pawnCoor[1]);
          return true;
        }
      }

      break;
    case ROOK:
      return legalRookMove(x1, y1, x2, y2);
      break;
    case KNIGHT:
      if (x1 + 2 === x2 || x1 - 2 === x2) {
        return y1 + 1 === y2 || y1 - 1 === y2;
      } else if (y1 + 2 === y2 || y1 - 2 === y2) {
        return x1 + 1 === x2 || x1 - 1 === x2;
      }
      break;
    case BISHOP:
      console.log('ses');
      return legalBishopMove(x1, y1, x2, y2);
      break;
    case QUEEN:
      return legalRookMove(x1, y1, x2, y2) || legalBishopMove(x1, y1, x2, y2);
      break;
    case KING:
      break;
  }
  return false;
}

function legalRookMove(x1, y1, x2, y2) {
  if (x1 === x2) {
    const start = Math.min(y1, y2);
    const end = Math.max(y1, y2);
    for (let i = start + 1; i < end; i++) {
      if (chess[x1][i]) return false;
    }
    return true;
  } else if (y1 === y2) {
    const start = Math.min(x1, x2);
    const end = Math.max(x1, x2);
    for (let i = start + 1; i < end; i++) {
      if (chess[i][y1]) return false;
    }
    return true;
  }
  return false;
}

function legalBishopMove(x1, y1, x2, y2) {
  let rowStart, rowEnd, colStart;

  if (x1 < x2) {
    rowStart = x1;
    rowEnd = x2;
    colStart = y1;
  } else {
    rowStart = x2;
    rowEnd = x1;
    colStart = y2;
  }
  if (x1 - y1 === x2 - y2) {
    for (let i = 1; rowStart + i < rowEnd; i++) {
      if (chess[rowStart + i][colStart + i]) return false;
    }
    return true;
  } else if (x1 + y1 === x2 + y2) {
    for (let i = 1; rowStart + i < rowEnd; i++) {
      if (chess[rowStart + i][colStart - i]) return false;
    }
    return true;
  }
  return false;
}

function setEnPassant(x1, y1, x2, y2) {
  const { type, color, hasMoved } = chess[x1][y1];
  const dir = color === WHITE ? -1 : 1;
  enPassant =
    type === PAWN && !hasMoved && y1 === y2 && x1 + dir * 2 === x2
      ? { x: x1 + dir, y: y1, pawnCoor: [x2, y2] }
      : null;
}

function createPiece(x, y, type, color) {
  const square = chessBoard[x][y];
  chess[x][y] = {
    type,
    color,
    hasMoved: false,
  };
  square.innerHTML = iconMap[type];

  let piece = square.firstChild;
  piece.style.color = color;
  piece.setAttribute('row', x);
  piece.setAttribute('col', y);
  piece.setAttribute('type', type);
  piece.setAttribute('color', color);
  piece.addEventListener('dragstart', dragStart);
  piece.addEventListener('dragend', dragEnd);
}

function clearBoard() {
  chess = [];
  for (let i = 0; i < boardSize; i++) {
    const arr = [];
    for (let j = 0; j < boardSize; j++) {
      chessBoard[i][j].innerHTML = '';
      arr.push(null);
    }
    chess.push(arr);
  }
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
    chessBoard.push(arr);
  }
  startGame();
}

function printBoard() {
  for (const row of chess) {
    console.log(row.map((piece) => (piece ? piece.type : 'null')));
  }
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

chessBoardEl.querySelectorAll('.square').forEach((square, idx) => {
  const x = parseInt(idx / boardSize);
  const y = idx % boardSize;
  square.addEventListener('dragenter', (e) => {
    if (!draggedPiece) return;
    // console.log('enter', e.currentTarget, x, y);
    e.currentTarget.classList.add('hover');
  });
  square.addEventListener('dragleave', (e) => {
    if (!draggedPiece) return;
    e.currentTarget.classList.remove('hover');
    // console.log('leave', e.currentTarget, x, y);
  });

  square.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!draggedPiece) return;
    e.currentTarget.classList.remove('hover');

    movePiece(draggedPiece, x, y);
    // console.log('drop', x, y, e.currentTarget);
  });

  // Dragging is not enabled by default
  square.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
});

initiliazeGame();
