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

import TicTacToe, { listeners } from "./Tic-Tac-Toe";
import strings from "./constants/strings.json";
import styles from "./constants/App.module.css";

export default function App() {
  const [size, setSize] = useState(3);
  const handleSizeChanged = useCallback((_, value) => {
    setSize(value);
  }, []);

  const boardStyle = useMemo(() => css`
    display: grid;
    grid-template-columns: repeat(${size}, 1fr);
    grid-template-rows: repeat(${size}, 1fr);
    grid-gap: 0.5em;
  `, [size]);

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
      listeners.onBoardChanged,
      onBoardChanged
    );

    const unregisterPlayer = newGame.addListener(
      listeners.onPlayerChanged,
      onPlayerChanged
    );

    const unregisterGameEnded = newGame.addListener(listeners.onGameEnded, onGameEnded);

    return () => {
      setGame(null);

      setBoard([]);
      unregisterBoard();

      setPlayer(null);
      unregisterPlayer();

      unregisterGameEnded();
    };
  }, [size, onBoardChanged, onPlayerChanged, onGameEnded]);

  const gameStateString = useMemo(() => {
    if (game === null && player === null) return null;
    else if (game === null && player === false) return strings.states.draw;
    else if (game === null && player !== null) return strings.states.win;
    else return strings.states.turn;
  }, [game, player]);

  const gameState = useMemo(() => gameStateString === null ? null : (
    <>
      <Typography variant="caption">{gameStateString}</Typography>
      <div>
        {gameStateString === strings.states.draw ? <Cancel color="disabled" /> : mark}
      </div>
    </>
  ), [gameStateString, mark]);

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
            {gameStateString === null ? strings.button.start : strings.button.restart}
          </Button>
        </>
      );
    else return null;
  }, [
    game,
    startGameHandler,
    handleSizeChanged,
    size,
    gameStateString
  ]);

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader
          title={strings.title}
          action={gameState}
          component={Paper}
          square
        />
        <CardContent className={boardStyle}>
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
