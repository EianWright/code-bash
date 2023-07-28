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

const getValidCoords = (currentX, currentY, board, xLength, yLength) => {
  let nextMove = [];

  if (checkCoords(currentX - 1, currentY, currentBoard, xLength, yLength)) {
    nextMove.append({ x: currentX - 1, y: currentY });
  } else if (
    checkCoords(currentX + 1, currentY, currentBoard, xLength, yLength)
  ) {
    nextMove.append({ x: currentX + 1, y: currentY });
  } else if (
    checkCoords(currentX, currentY - 1, currentBoard, xLength, yLength)
  ) {
    nextMove.append({ x: currentX, y: currentY - 1 });
  } else if (
    checkCoords(currentX, currentY + 1, currentBoard, xLength, yLength)
  ) {
    nextMove.append({ x: currentX, y: currentY + 1 });
  }
  console.log(nextMove);
  return nextMove;
};

const playGame = async (gameId, playerId, startingData) => {
  const moveUrl = `${baseUrl}/games/${gameId}/move`;
  const getUrl = `${baseUrl}/games/${gameId}`;

  const yLength = startingData.board[0].length;
  const xLength = startingData.board.length;
  let currentData = startingData;
  while (!currentData.winner) {
    let currentX = currentData.current_player.x;
    let currentY = currentData.current_player.y;
    let currentBoard = currentData.board;

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
      .catch((e) => {
        console.log(e);
        return;
      });
    if (!response) {
      break;
    }
    currentData = response.data[0];
  }
  const final = await axios.get(getUrl, {}, { params: { gameId: gameId } });
  console.log(final.data.games);
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
