export type Delta = {
  type: 'update-player-position';
  player: string;
  playerPosition: PlayerPosition;
};

export type State = {
  playersPositions: {
    [key: string]: PlayerPosition;
  };
};

export type PlayerPosition = {
  panX: number;
  panY: number;
  zoom: number;
  cursorX: number;
  cursorY: number;
};

export function initialState(): State {
  return {
    playersPositions: {},
  };
}

export function applyDelta(delta: Delta, state: State) {
  if (!state.playersPositions) state.playersPositions = {};

  switch (delta.type) {
    case 'update-player-position':
      state.playersPositions[delta.player] = delta.playerPosition;
      break;
  }
}
