const axios = require("axios");
const prompt = require("prompt-sync")();

const baseUrl = "http://light-bikes.inseng.net";

const joinGame = async (gameId, name) => {
  const joinUrl = `${baseUrl}/games/${gameId}/join`;
  const response = await axios.post(
    joinUrl,
    { name: name },
    { params: { name: name } }
  );
  return response.data[0];
};

const createGame = async (
  addServerBot,
  boardSize,
  numPlayers,
  serverBotDifficulty
) => {
  const createUrl = `${baseUrl}/games`;
  const response = await axios.post(
    createUrl,
    {},
    {
      params: {
        addServerBot: addServerBot,
        boardSize: boardSize,
        numPlayers: numPlayers,
        serverBotDifficulty: serverBotDifficulty,
      },
    }
  );
  return response.data.id;
};

const checkCoords = (testX, testY, board, xLength, yLength) => {
  return (
    testX >= 0 &&
    testX < xLength &&
    testY >= 0 &&
    testY < yLength &&
    !board[testX][testY]
  );
};

const getValidCoords = (currentX, currentY, currentBoard, xLength, yLength) => {
  let nextMove = [];

  if (checkCoords(currentX - 1, currentY, currentBoard, xLength, yLength)) {
    nextMove.push({ x: currentX - 1, y: currentY });
  }
  if (checkCoords(currentX + 1, currentY, currentBoard, xLength, yLength)) {
    nextMove.push({ x: currentX + 1, y: currentY });
  }
  if (checkCoords(currentX, currentY - 1, currentBoard, xLength, yLength)) {
    nextMove.push({ x: currentX, y: currentY - 1 });
  }
  if (checkCoords(currentX, currentY + 1, currentBoard, xLength, yLength)) {
    nextMove.push({ x: currentX, y: currentY + 1 });
  }

  return nextMove;
};

const nearestStop = (coord, board, xLength, yLength) => {
  let dist = board.length;
  let currX = coord.x;
  let currDist = 0;
  while (currX > 0) {
    currX -= 1;
    if (board[currX][coord.y]) {
      break;
    }
    currDist += 1;
  }
  if (currDist < dist) {
    dist = currDist;
  }
  currDist = 0;
  currX = coord.x;
  while (currX < xLength) {
    currX += 1;
    if (board[currX][coord.y]) {
      break;
    }
    currDist += 1;
  }
  if (currDist < dist) {
    dist = currDist;
  }

  let currY = coord.y;
  currDist = 0;
  while (currY > 0) {
    currY -= 1;
    if (board[coord.x][currY]) {
      break;
    }
    currDist += 1;
  }
  if (currDist < dist) {
    dist = currDist;
  }
  currDist = 0;
  currY = coord.y;
  currDist = 0;
  while (currY < yLength) {
    currY += 1;
    if (board[coord.x][currY]) {
      break;
    }
    currDist += 1;
  }
  if (currDist < dist) {
    dist = currDist;
  }
  return dist;
};

const countMoves = (currentX, currentY, board, xLength, yLength) => {
  /*const countMoves = (
  currentX,
  currentY,
  board,
  xLength,
  yLength,
  filler,
  existing
) => {
  const currentBoard = board;
  let count = 1;
  let nextMove = {};
  currentBoard[currentX][currentY] = filler;
  let mostMoves = 0;
  if (
    anotherCheckCoords(
      currentX - 1,
      currentY,
      currentBoard,
      xLength,
      yLength,
      filler,
      existing
    )
  ) {
    let up = countMoves(currentX - 1, currentY, currentBoard, xLength, yLength);
    if (up > mostMoves) {
      mostMoves = up;
    }
  }
  if (
    anotherCheckCoords(
      currentX + 1,
      currentY,
      currentBoard,
      xLength,
      yLength,
      filler,
      existing
    )
  ) {
    let down = countMoves(
      currentX + 1,
      currentY,
      currentBoard,
      xLength,
      yLength
    );
    if (down > mostMoves) {
      mostMoves = down;
    }
  }
  if (
    anotherCheckCoords(
      currentX,
      currentY - 1,
      currentBoard,
      xLength,
      yLength,
      filler,
      existing
    )
  ) {
    let left = countMoves(
      currentX,
      currentY - 1,
      currentBoard,
      xLength,
      yLength
    );
    if (left > mostMoves) {
      mostMoves = left;
    }
  }
  if (
    anotherCheckCoords(
      currentX,
      currentY + 1,
      currentBoard,
      xLength,
      yLength,
      filler,
      existing
    )
  ) {
    let right = countMoves(
      currentX,
      currentY + 1,
      currentBoard,
      xLength,
      yLength
    );
    if (right > mostMoves) {
      mostMoves = right;
    }
  }

  return mostMoves + 1;*/
  const currentBoard = [...board];
  let count = 1;
  let nextMove = {};
  currentBoard[currentX][currentY] = "used";
  while (true) {
    if (checkCoords(currentX - 1, currentY, currentBoard, xLength, yLength)) {
      nextMove.x = currentX - 1;
      nextMove.y = currentY;
    } else if (
      checkCoords(currentX + 1, currentY, currentBoard, xLength, yLength)
    ) {
      nextMove.x = currentX + 1;
      nextMove.y = currentY;
    } else if (
      checkCoords(currentX, currentY - 1, currentBoard, xLength, yLength)
    ) {
      nextMove.x = currentX;
      nextMove.y = currentY - 1;
    } else if (
      checkCoords(currentX, currentY + 1, currentBoard, xLength, yLength)
    ) {
      nextMove.x = currentX;
      nextMove.y = currentY + 1;
    } else {
      return count;
    }
    currentBoard[nextMove.x][nextMove.y] = "used";
    currentX = nextMove.x;
    currentY = nextMove.y;
    count += 1;
  }
};

const manhattanDist = (x1, x2, y1, y2) => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

const weightCoords = (
  validCoords,
  otherPlayer,
  length,
  board,
  xLength,
  yLength
) => {
  const otherPlayerX = otherPlayer.x;
  const otherPlayerY = otherPlayer.y;

  let greatestMoves = 0;
  let closestCoord = null;

  /*validCoords.forEach((coord) => {
    let currDist = manhattanDist(
      coord.x,
      otherPlayer.x,
      coord.y,
      otherPlayer.y
    );
    if (currDist < closestDist) {
      closestDist = currDist;
      closestCoord = coord;
    }
  });*/

  validCoords.forEach((coord) => {
    let numMoves = countMoves(coord.x, coord.y, board, xLength, yLength);
    if (numMoves > greatestMoves) {
      greatestMoves = numMoves;
      closestCoord = coord;
    }
    //console.log(numMoves);
    //console.log(coord);
  });
  /*
  let closestDist = xLength + yLength;
  validCoords.forEach((coord) => {
    const currDist = nearestStop(coord, board, xLength, yLength);
    if (currDist < closestDist) {
      closestDist = currDist;
      closestCoord = coord;
    }
  });
  return closestCoord;*/

  return closestCoord;
};

const checkPosition = (
  currentX,
  currentY,
  otherPlayer,
  board,
  xLength,
  yLength
) => {
  const xDiff = currentX - otherPlayer.x;
  let controlX = 0;
  if (xDiff > 0) {
    controlX = xLength - currentX;
  } else {
    controlX = currentX;
  }
  const yDiff = currentY - otherPlayer.y;
  let controlY = 0;
  if (yDiff > 0) {
    controlY = yLength - currentY;
  } else {
    controlY = currentY;
  }

  if (controlX > xLength / 2) {
    let upValid = checkCoords(currentX, currentY + 1, board, xLength, yLength);
    if (upValid) return { x: currentX, y: currentY + 1 };
    let downValid = checkCoords(
      currentX,
      currentY - 1,
      board,
      xLength,
      yLength
    );
    if (downValid) return { x: currentX, y: currentY - 1 };
  }

  if (controlY > yLength / 2) {
    let leftValid = checkCoords(
      currentX - 1,
      currentY,
      board,
      xLength,
      yLength
    );
    if (leftValid) return { x: currentX - 1, y: currentY };
    let rightValid = checkCoords(
      currentX + 1,
      currentY,
      board,
      xLength,
      yLength
    );
    if (rightValid) return { x: currentX + 1, y: currentY };
  }
  return null;
};

const playGame = async (gameId, playerId, startingData) => {
  const moveUrl = `${baseUrl}/games/${gameId}/move`;
  const getUrl = `${baseUrl}/games/${gameId}`;

  const yLength = startingData.board[0].length;
  const xLength = startingData.board.length;
  let currentData = startingData;
  let numMoves = 0;
  while (!currentData.winner) {
    let currentX = currentData.current_player.x;
    let currentY = currentData.current_player.y;
    let currentBoard = currentData.board;
    let otherPlayer = currentData.players.find(
      (player) => player.color !== currentData.current_player.color
    );
    //console.log(otherPlayer);

    let nextMove = {};

    if (checkCoords(currentX - 1, currentY, currentBoard, xLength, yLength)) {
      nextMove.x = currentX - 1;
      nextMove.y = currentY;
    } else if (
      checkCoords(currentX + 1, currentY, currentBoard, xLength, yLength)
    ) {
      nextMove.x = currentX + 1;
      nextMove.y = currentY;
    } else if (
      checkCoords(currentX, currentY - 1, currentBoard, xLength, yLength)
    ) {
      nextMove.x = currentX;
      nextMove.y = currentY - 1;
    } else {
      nextMove.x = currentX;
      nextMove.y = currentY + 1;
    }

    const validCoords = getValidCoords(
      currentX,
      currentY,
      currentBoard,
      xLength,
      yLength
    );
    const randomIndex = Math.floor(Math.random() * validCoords.length);
    if (validCoords.length > 0) {
      nextMove = validCoords[randomIndex];
    }

    /*let aggressiveMove = null;
    if (numMoves < xLength) {
      aggressiveMove = checkPosition(
        currentX,
        currentY,
        otherPlayer,
        currentBoard,
        xLength,
        yLength
      );
      if (aggressiveMove) {
        nextMove = aggressiveMove;
      }
    }*/

    suggestedMove = weightCoords(
      validCoords,
      otherPlayer,
      xLength,
      currentBoard,
      xLength,
      yLength
    );
    if (suggestedMove) {
      nextMove = suggestedMove;
    }

    const response = await axios
      .post(
        moveUrl,
        {},
        {
          params: {
            gameId: gameId,
            playerId: playerId,
            x: nextMove.x,
            y: nextMove.y,
          },
        }
      )
      .catch(async (e) => {
        console.log(e.data);
        currentData = await axios.get(
          getUrl,
          {},
          { params: { gameId: gameId } }
        );
      });
    if (!response) {
      break;
    }
    currentData = response.data[0];
    numMoves += 1;
  }
  const final = await axios.get(getUrl, {}, { params: { gameId: gameId } });
  const finalData = final.data.games[0];
  if (finalData.winner === finalData.current_player.color) {
    console.log("You won!");
  } else {
    console.log("You lost :(");
  }
};

const joinAndPlayGame = async (gameId) => {
  const startingData = await joinGame(gameId, "Eian");
  playGame(gameId, startingData.current_player.id, startingData);
};

const createAndJoinGame = async (
  addServerBot,
  boardSize,
  numPlayers,
  serverBotDifficulty
) => {
  const gameId = await createGame(
    addServerBot,
    boardSize,
    numPlayers,
    serverBotDifficulty
  );
  const startingData = await joinGame(gameId, "Eian");
  playGame(gameId, startingData.current_player.id, startingData);
};

let input = prompt("Start and join game?");
if (input === "y") {
  input = prompt("bot difficulty\n");
  createAndJoinGame(true, 0, 2, input);
} else {
  input = prompt("Game id to join\n");
  joinAndPlayGame(input);
}
