const chessBoardEl = document.getElementById("chessBoard");
const squares = [];
const promotionWhiteEl = document.getElementById("promotionWhite");
const promotionBlackEl = document.getElementById("promotionBlack");

const htmlBoard = [];
const boardSize = 8; // squares
const boxSize = 80; // px

// Piece Types
const [PAWN, ROOK, KNIGHT, BISHOP, QUEEN, KING] = [
  "pawn",
  "rook",
  "knight",
  "bishop",
  "queen",
  "king",
];
// Piece colors
const [BLACK, WHITE] = ["black", "white"];
// Special moves
const [EN_PASSANT, QUEENSIDE_CASTLING, KINGSIDE_CASTLING, PROMOTION] = [
  "enPassant",
  "queensideCastling",
  "kingsideCastling",
  "promotion",
];


const iconMap = {
  [PAWN]: PAWN_HTML,
  [ROOK]: ROOK_HTML,
  [KNIGHT]: KNIGHT_HTML,
  [BISHOP]: BISHOP_HTML,
  [QUEEN]: QUEEN_HTML,
  [KING]: KING_HTML,
};

const startingColor = WHITE;

const queenSideSquares = [getIdx(boardSize - 1, 3), getIdx(0, 3)];
const kingSideSquares = [getIdx(boardSize - 1, 5), getIdx(0, 5)];

const knightDirections = [
  [2, 1],
  [2, -1],
  [-2, 1],
  [-2, -1],
  [1, 2],
  [1, -2],
  [-1, 2],
  [-1, -2],
];

let draggedPiece;
let isWhiteTurn;
let isPromoting;
let isChecking;
let blockedQueenSide;
let blockedKingSide;
let chessGame;

initiliazeGame();

function startGame() {
  draggedPiece = null;
  isWhiteTurn = WHITE === startingColor;
  isChecking = false;
  blockedQueenSide = false;
  blockedKingSide = false;
  clearBoard();
  placePieces();

  collectPieces(startingColor, chessGame.board).forEach((idx) => {
    const [x, y] = getCoor(idx);
    const legalMoves = computeMoves(idx, chessGame);
    chessGame.board[x][y].moves = simulateMoves(idx, legalMoves, chessGame);
  });
}

function movePiece(pieceEl, to) {
  const from = pieceIdx(pieceEl);
  const [x1, y1] = getCoor(from);
  const [x2, y2] = getCoor(to);
  const { board } = chessGame;
  const { color, moves } = board[x1][y1];
  if ((color === WHITE) !== isWhiteTurn || isPromoting) return;
  const move = moves[to];

  if (!move) return; // illegal move

  const { chess, capturedPiece, enemyLegalMovesMap, specialMove } = move;

  moveSpecial(x2, y2, specialMove);
  if (isPromoting) return;

  chessGame = chess;
  isWhiteTurn = !isWhiteTurn;
  movePieceEl(x2, y2, pieceEl);
  highlightMove(from, to);
  // chessBoardEl.style.flexDirection = isWhiteTurn ? 'column' : 'column-reverse';

  if (capturedPiece) console.log(capturedPiece);
  console.table(chess.board);

  // check if enemy king is checked after the move is made
  // check all pieces for discovered checks and not just the single piece
  isChecking = false;
  collectPieces(color, chess.board).forEach((idx) =>
    computeMoves(idx, chessGame)
  );

  if (isChecking) console.log("Check!!!");

  let hasMoves = false;

  for (const [idx, legalMoves] of Object.entries(enemyLegalMovesMap)) {
    const [x, y] = getCoor(idx);
    const eneyMoves = simulateMoves(idx, legalMoves, chessGame);
    chessGame.board[x][y].moves = eneyMoves;
    if (0 < Object.keys(eneyMoves).length) hasMoves = true;
  }

  if (!hasMoves) {
    if (isChecking) console.log("Checkmate!!!");
    else console.log("Stalemate lol");
  }
}

function simulateMoves(from, legalMoves, chess) {
  const moves = {};
  legalMoves.forEach((to) => {
    const move = simulateMove(from, to, chess);
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
      specialMove = { type: PROMOTION, pieceIdx: from };
    }
  } else if (type === KING) {
    if (y1 - 2 === y2) {
      // Queenside castling
      board[x1][0].hasMoved = true;
      board[x1][y1 - 1] = board[x1][0];
      board[x1][0] = null;
      specialMove = { type: QUEENSIDE_CASTLING, pieceIdx: getIdx(x1, 0) };
    } else if (y1 + 2 === y2) {
      // Kingside castling
      board[x1][boardSize - 1].hasMoved = true;
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

function moveSpecial(x2, y2, specialMove) {
  if (!specialMove) return;

  const { type, pieceIdx } = specialMove;
  const [x, y] = getCoor(pieceIdx);

  if (type === EN_PASSANT) {
    htmlBoard[x][y].innerHTML = "";
  } else if (type === QUEENSIDE_CASTLING) {
    const rookEl = htmlBoard[x][y].firstChild;
    movePieceEl(x2, y2 + 1, rookEl);
  } else if (type === KINGSIDE_CASTLING) {
    const rookEl = htmlBoard[x][y].firstChild;
    movePieceEl(x2, y2 - 1, rookEl);
  } else if (type === PROMOTION) {
    isPromoting = true;
    const promotionContainer = isWhiteTurn
      ? promotionWhiteEl
      : promotionBlackEl;
    promotionContainer.setAttribute("from", pieceIdx);
    promotionContainer.setAttribute("to", getIdx(x2, y2));
    promotionContainer.style.left = boxSize * y2 - 3 + "px";
    promotionContainer.classList.remove("hide");
  }
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

// Promotes the pawn and moves it to the correct position
function promote(from, to, type) {
  const [x1, y1] = getCoor(from);
  const [x2, y2] = getCoor(to);
  const piece = chessGame.board[x1][y1];
  const { moves, color } = piece;
  const move = moves[to]; // The move which promotes the pawn

  move.chess.board[x2][y2].type = type;
  move.specialMove = null;
  isPromoting = false;
  const pieceEl = createPiece(x1, y1, type, color, moves);
  htmlBoard[x1][y1].innerHTML = "";

  movePiece(pieceEl, to);
}

function collectPieces(color, board) {
  const allyPieces = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] && board[i][j].color === color)
        allyPieces.push(getIdx(i, j));
    }
  }
  return allyPieces;
}

function createPiece(x, y, type, color, moves = null) {
  const piece = {
    type,
    color,
    hasMoved: false,
    moves,
  };
  chessGame.board[x][y] = piece;

  
  const pieceEl = document.createElement('div');
  pieceEl.innerHTML = iconMap[type];
  pieceEl.firstChild.classList.add(color);

  pieceEl.setAttribute('draggable', 'true');
  pieceEl.setAttribute("square", getIdx(x, y));
  pieceEl.setAttribute("type", type);
  pieceEl.setAttribute("color", color);
  pieceEl.addEventListener("dragstart", dragStart);
  pieceEl.addEventListener("dragend", dragEnd);
  pieceEl.addEventListener("click", onClick); // highlight legal moves for the piece

  const square = htmlBoard[x][y];
  square.appendChild(pieceEl);
  return pieceEl;
}

function clearBoard() {
  const board = [];
  for (let i = 0; i < boardSize; i++) {
    const arr = [];
    for (let j = 0; j < boardSize; j++) {
      htmlBoard[i][j].innerHTML = "";
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
  square.innerHTML = "";
  square.appendChild(pieceEl);
  pieceEl.setAttribute("square", getIdx(x, y));
}

function highlightMove(from, to) {
  squares.forEach((square) => square.classList.remove("highlight"));
  squares[from].classList.add("highlight");
  squares[to].classList.add("highlight");
}

function initiliazeGame() {
  createHtmlSquares();
  for (const row of chessBoardEl.querySelectorAll(".row")) {
    const arr = [];
    for (const square of row.querySelectorAll(".square")) {
      arr.push(square);
    }
    htmlBoard.push(arr);
  }

  addSquareEventListeners();
  fillPromotionContainer(promotionWhiteEl)
  fillPromotionContainer(promotionBlackEl)
  addPromotionEventListeners(promotionWhiteEl);
  addPromotionEventListeners(promotionBlackEl);

  startGame();
}

function createHtmlSquares(){
  for(let i = 0; i < boardSize; i++){
    const row = document.createElement('div');
    row.className = 'row';
    for(let j = 0; j < boardSize; j++){
      const square = document.createElement('div');
      square.className = 'square';
      squares.push(square);
      row.appendChild(square);
    }
    chessBoardEl.appendChild(row);
  }
}

function fillPromotionContainer(promotionEl){
  promotionEl.appendChild(createButton(QUEEN))
  promotionEl.appendChild(createButton(BISHOP))
  promotionEl.appendChild(createButton(KNIGHT))
  promotionEl.appendChild(createButton(ROOK))
}

function createButton(type){
  const button = document.createElement('button');
  button.className = 'square';
  button.setAttribute('type', type);
  button.appendChild(document.createElement('div'));
  button.firstChild.innerHTML = iconMap[type];

  return button
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

function onClick(e) {
  const pieceEl = e.currentTarget;
  if ((pieceEl.getAttribute("color") === WHITE) !== isWhiteTurn) return;
  const idx = pieceIdx(pieceEl);
  const moves = simulateMoves(idx, computeMoves(idx, chessGame), chessGame);
  squares.forEach((square) => square.classList.remove("highlight"));
  squares[idx].classList.add("highlight");
  Object.keys(moves).forEach((to) =>
    squares[parseInt(to)].classList.add("highlight")
  );
}

function printBoard() {
  for (const row of chessGame.board) {
    console.log(row.map((piece) => (piece ? piece.type : "null")));
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

function addSquareEventListeners() {
  squares.forEach((square, idx) => {
    square.setAttribute("index", idx);

    square.addEventListener("dragenter", dragEnter);
    square.addEventListener("dragleave", dragLeave);
    square.addEventListener("drop", drop);
    // Dragging is not enabled by default
    square.addEventListener("dragover", dragOver);
  });
}

function dragEnter(e) {
  if (!draggedPiece) return;
  e.currentTarget.classList.add("hover");
}

function dragLeave(e) {
  if (!draggedPiece) return;
  e.currentTarget.classList.remove("hover");
}

function drop(e) {
  e.preventDefault();
  if (!draggedPiece) return;
  e.currentTarget.classList.remove("hover");
  const idx = parseInt(e.currentTarget.getAttribute("index"));
  movePiece(draggedPiece, idx);
}

function dragOver(e) {
  e.preventDefault();
}

function addPromotionEventListeners(containerEl) {
  containerEl.querySelectorAll(".square").forEach((pieceEl) => {
    pieceEl.addEventListener("click", (e) => {
      if (!isPromoting) return;
      const btnEl = e.currentTarget;
      containerEl.classList.add("hide");
      promote(
        containerEl.getAttribute("from"),
        containerEl.getAttribute("to"),
        btnEl.getAttribute("type")
      );
    });
  });
}

function pieceIdx(pieceEl) {
  return parseInt(pieceEl.getAttribute("square"));
}

function getCoor(idx) {
  const x = parseInt(idx / boardSize);
  const y = idx % boardSize;
  return [x, y];
}

function getIdx(x, y) {
  return x * boardSize + y;
}
