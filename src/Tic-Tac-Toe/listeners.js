const listeners = Object.freeze({
  onBoardChanged: Symbol("onBoardChanged"),
  onPlayerChanged: Symbol("onPlayerChanged"),
  onGameEnded: Symbol("onGameEnded"),
});

export default listeners;