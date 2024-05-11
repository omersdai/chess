// Computes possible legal moves for a chess piece
function computeMoves(idx, chess) {
    const [x, y] = getCoor(idx);
    const { board, enPassant } = chess;
    const piece = board[x][y];
    if (!piece) throw "No piece to compute moves!";
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
    knightDirections.forEach((dir) => {
      if (valid(x + dir[0], y + dir[1], color, board))
        legalMoves.push(getIdx(x + dir[0], y + dir[1]));
    });
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