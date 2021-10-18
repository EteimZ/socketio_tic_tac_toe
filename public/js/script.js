const socket = io();
let symbol;

const message = document.querySelector("#messages");
const board = document.querySelectorAll(".board button");
const button = document.querySelectorAll(".board> button");


// Initially disable board
board.forEach(setAttr)
// Add event listener to buttons
button.forEach((val)=>{val.addEventListener('click', makeMove);})

// Event is called when either player makes a move
socket.on("move.made", function (data) {

  // Render the move
  document.querySelector("#" + data.position).textContent = data.symbol;
  // If the symbol is the same as the player's symbol,
  // we can assume it is their turn

  myTurn = data.symbol !== symbol;

  // If the game is still going, show who's turn it is
  if (!isGameOver()) {
    if (gameTied()) {
      message.textContent = "Game Drawn!";
      board.forEach(setAttr)
    }else {
      renderTurnMessage();
    }
  // If the game is over
  }else{
    // Show the message for the loser
    if (myTurn) {
      message.textContent = "Game over. You lost.";
      // Show the message for the winner
    }else {
      message.textContent = "Game over. You won!";
    }
    board.forEach(setAttr)
  }
});

// Set up the initial state when the game begins
socket.on("game.begin", function (data) {

  // The server will asign X or O to the player
  symbol = data.symbol;
  // Give X the first turn
  myTurn = symbol === "X";

  renderTurnMessage();
});

// Disable the board if the opponent leaves
socket.on("opponent.left", function () {
  message.textContent = "Your opponent left the game.";
  board.forEach(setAttr);
});


function getBoardState() {
  var obj = {};
  // We will compose an object of all of the Xs and Ox
  // that are on the board
  button.forEach((val)=> {
    obj[val.getAttribute("id")] = val.textContent || "";
  });
  return obj;
}

function gameTied() {
  var state = getBoardState();

  if (
    state.a0 !== "" &&
    state.a1 !== "" &&
    state.a2 !== "" &&
    state.b0 !== "" &&
    state.b1 !== "" &&
    state.b2 !== "" &&
    state.b3 !== "" &&
    state.c0 !== "" &&
    state.c1 !== "" &&
    state.c2 !== ""
  ) {
    return true;
  }
}

function isGameOver() {
  var state = getBoardState(),
    // One of the rows must be equal to either of these
    // value for
    // the game to be over
    matches = ["XXX", "OOO"],
    // These are all of the possible combinations
    // that would win the game
    rows = [
      state.a0 + state.a1 + state.a2,
      state.b0 + state.b1 + state.b2,
      state.c0 + state.c1 + state.c2,
      state.a0 + state.b1 + state.c2,
      state.a2 + state.b1 + state.c0,
      state.a0 + state.b0 + state.c0,
      state.a1 + state.b1 + state.c1,
      state.a2 + state.b2 + state.c2,
    ];

  // to either 'XXX' or 'OOO'
  for (var i = 0; i < rows.length; i++) {
    if (rows[i] === matches[0] || rows[i] === matches[1]) {
      console.log(rows);
      return true;
    }
  }
}

function renderTurnMessage() {
  // Disable the board if it is the opponents turn
  if (!myTurn) {
    message.textContent = "Your opponent's turn";
    board.forEach(setAttr)
    // Enable the board if it is your turn
  }else {
    message.textContent = "Your turn.";
    board.forEach((val) => {val.removeAttribute("disabled")});
  }
}

function makeMove(e) {
  e.preventDefault();
  // It's not your turn
  if (!myTurn) {
    return;
  }
  // The space is already checked
  if (this.textContent.length) {
    return;
  }

  // Emit the move to the server
  socket.emit("make.move", {
    symbol: symbol,
    position: this.getAttribute("id"),
  });
}

// function to disable board
function setAttr(val) {
  val.setAttribute("disabled", true);
}