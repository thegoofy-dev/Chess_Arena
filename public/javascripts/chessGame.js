const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board(); // Get the current state of the chess board
  boardElement.innerHTML = ""; // Clear previous board rendering

  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div"); // Create a square element
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark" // Alternate square colors
      );

      squareElement.dataset.row = rowIndex; // Set row index
      squareElement.dataset.col = squareIndex; // Set column index

      if (square) {
        const pieceElement = document.createElement("div"); // Create a piece element
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black" // Set piece color
        );
        pieceElement.innerText = getPieceUnicode(square); // Set piece display

        pieceElement.draggable = playerRole === square.color; // Allow dragging for the current player's pieces

        // Event listener for dragging the piece
        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement; // Store the dragged piece
            sourceSquare = { row: rowIndex, col: squareIndex }; // Store original square
            e.dataTransfer.setData("text/plain", ""); // Required for drag-and-drop
          }
        });

        // Event listener for when dragging ends
        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null; // Reset the dragged piece
          sourceSquare = null; // Reset the source square
        });

        squareElement.appendChild(pieceElement); // Append the piece to the square
      }

      // Allow dropping a piece onto the square
      squareElement.addEventListener("dragover", (e) => {
        e.preventDefault(); // Prevent default behavior to allow drop
      });

      // Handle piece drop
      squareElement.addEventListener("drop", (e) => {
        e.preventDefault(); // Prevent default behavior
        if (draggedPiece) {
          // If a piece is being dragged
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };

          handleMove(sourceSquare, targetSquare); // Process the move
        }
      });

      boardElement.appendChild(squareElement); // Append the square to the board
    });
  });

  if(playerRole === 'b') {
    boardElement.classList.add("flipped")
  }
  else {
    boardElement.classList.remove("flipped");
  }
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,  // Corrected from 'form' to 'from'
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
  renderBoard();
};

const getPieceUnicode = (piece) => {
  const pieceMapping = {
    p: "♟", // Pawn
    r: "♖", // Rook
    n: "♞", // Knight
    b: "♗", // Bishop
    q: "♕", // Queen
    k: "♔", // King
    P: "♙", // White Pawn
    R: "♖", // White Rook
    N: "♘", // White Knight
    B: "♗", // White Bishop
    Q: "♕", // White Queen
    K: "♔", // White King
  };

  return pieceMapping[piece.type] || ""; // Return corresponding Unicode character
};

// Socket event listeners
socket.on("playerRole", (role) => {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

// Call renderBoard to initialize the chessboard
renderBoard();
