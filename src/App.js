import React, { useState, useMemo, useCallback } from "react";
import { css } from "emotion";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActionArea,
  Slider,
  Paper,
  Typography,
  CardActions,
  Collapse
} from "@material-ui/core";

import { Close, RadioButtonUnchecked, Cancel } from "@material-ui/icons";

import TicTacToe from "./Tic-Tac-Toe";

export default function App() {
  const [size, setSize] = useState(3);
  const handleSizeChanged = useCallback((event, value) => {
    setSize(value);
  }, []);

  const styles = useMemo(
    () => ({
      container: css`
        height: 100%;
        width: 100%;
        padding: 1em;
        box-sizing: border-box;
        position: relative;
      `,
      actionContainer: css`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      `,
      sizeSliderContainer: css`
        width: 5em;
        margin-left: 1em;
      `,
      card: css`
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
      `,
      board: css`
        display: grid;
        grid-template-columns: repeat(${size}, 1fr);
        grid-template-rows: repeat(${size}, 1fr);
        grid-gap: 0.5em;
      `,
      positionButton: css`
        height: 100%;
      `,
      positionContainer: css`
        display: flex;
        align-items: center;
        justify-content: center;
      `
    }),
    [size]
  );

  const [game, setGame] = useState(null);
  const [board, setBoard] = useState([]);
  const [player, setPlayer] = useState(null);
  const [mark, setMark] = useState(null);

  const onBoardChanged = useCallback(nextBoard => {
    setBoard(nextBoard);
  }, []);

  const onPlayerChanged = useCallback((p, m) => {
    setPlayer(p);
    setMark(m);
  }, []);

  const onGameEnded = useCallback((gameEnded, winner, mark) => {
    if (gameEnded) {
      console.log({ gameEnded, winner, mark });
      setGame(null);
      if (winner !== null) {
        setPlayer(winner);
        setMark(mark);
      } else {
        setPlayer(false);
        setMark(false);
      }
    }
  }, []);

  const startGameHandler = useCallback(() => {
    const newGame = new TicTacToe(
      <Close color="primary" />,
      <RadioButtonUnchecked color="secondary" />,
      size
    );
    setGame(newGame);

    const unregisterBoard = newGame.addListener(
      "onBoardChanged",
      onBoardChanged
    );
    const unregisterPlayer = newGame.addListener(
      "onPlayerChanged",
      onPlayerChanged
    );

    const unregisterGameEnded = newGame.addListener("onGameEnded", onGameEnded);

    return () => {
      setGame(null);

      setBoard([]);
      unregisterBoard();

      setPlayer(null);
      unregisterPlayer();

      unregisterGameEnded();
    };
  }, [size, onBoardChanged, onPlayerChanged, onGameEnded]);

  const title = useMemo(() => "Tic Tac Toe", []);

  const gameState = useMemo(() => {
    if (game === null && player === null) return null;
    else if (game === null && player === false) return `Draw!`;
    else if (game === null && player !== null) return "Winner!";
    else return "Turn";
  }, [game, player]);

  const action = useMemo(() => {
    if (game === null)
      return (
        <>
          <div className={styles.sizeSliderContainer}>
            <Slider
              value={size}
              min={3}
              max={5}
              onChange={handleSizeChanged}
              valueLabelFormat={size => `${size}×${size}`}
              valueLabelDisplay="auto"
              marks
            />
          </div>
          <Button variant="outlined" onClick={startGameHandler}>
            {gameState === null ? "Play!" : "Play Again!"}
          </Button>
        </>
      );
    else return null;
  }, [
    game,
    startGameHandler,
    handleSizeChanged,
    size,
    styles.sizeSliderContainer
  ]);

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader
          component={Paper}
          title={title}
          square
          action={
            <>
              <Typography variant="caption">{gameState}</Typography>
              <div>
                {gameState === "Draw!" ? <Cancel color="disabled" /> : mark}
              </div>
            </>
          }
        />
        <CardContent className={styles.board}>
          {board.map((s, p) => {
            return (
              <Card key={p}>
                <CardActionArea
                  onClick={
                    s === null && game !== null
                      ? () => game.selectPosition(p)
                      : undefined
                  }
                  disabled={s !== null || game === null}
                  className={styles.positionButton}
                >
                  <CardContent className={styles.positionContainer}>
                    {s}
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </CardContent>
        <Collapse in={action !== null}>
          <Paper
            square
            component={CardActions}
            className={styles.actionContainer}
          >
            {action}
          </Paper>
        </Collapse>
      </Card>
    </div>
  );
}
