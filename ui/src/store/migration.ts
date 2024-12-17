import { colorSequence } from '~/lib/util';

import { type GameSpace } from './types';

export default function migration(gottenState: GameSpace): GameSpace {
  if ((gottenState.version as 3) === 3) {
    gottenState.lastChangeAt = Date.now();
    // @ts-ignore
    gottenState.version = 4;
  }
  if ((gottenState.version as 4) === 4) {
    const status = (gottenState as any).status;
    gottenState.isArchived = false;
    gottenState.isLibraryItem = false;
    if (status === 'archived') gottenState.isArchived = true;
    if (status === 'library') gottenState.isLibraryItem = true;
    // @ts-ignore
    delete gottenState.status;
    // @ts-ignore
    gottenState.version = 5;
  }

  if ((gottenState.version as 5) === 5) {
    const max = (gottenState as any)?.minMaxPlayers[1] || 0;
    gottenState.playersSlots = [];
    for (let i = 0; i < max; i++) {
      gottenState.playersSlots.push({
        color: colorSequence(i, max),
        pubKey: (gottenState as any)?.players[i] || null,
      });
    }
    // @ts-ignore
    gottenState.version = 6;
  }

  if ((gottenState.version as 6) === 6) {
    gottenState.elements.forEach((el) => {
      if (el.type === 'TurnTracker') {
        if ((el.version as 1) === 1) {
          el.showEmptyPlayersSlots = true;
          el.turnsLog.forEach((tl) => {
            const oldTl = tl as unknown as { player: null | string };
            if (oldTl.player === null) {
              tl.playerSlot = -1;
            } else if (oldTl.player) {
              const index = gottenState.playersSlots.findIndex((p) => p.pubKey === oldTl.player);
              // The player might have left the game
              // In that case we don't have the information about which player slot it was on, so let's just assign slot 0
              tl.playerSlot = index !== -1 ? index : 0;
            }
            delete oldTl.player;
          });
          el.version = 2;
        }
      }

      if (el.type === 'PlayerPiece') {
        if ((el.version as 2) === 2) {
          el.version = 3;
          const agent = (el as any).agent;
          el.playerSlot = gottenState.playersSlots.findIndex((p) => p.pubKey === agent) || 0;
          delete (el as any).agent;
          delete (el as any).colorRing;
        }
      }

      if (el.type === 'Dice') {
        if ((el.version as 1) === 1) {
          el.rolls.forEach((roll) => {
            if ((roll as any).player) {
              roll.playerSlot =
                gottenState.playersSlots.findIndex((p) => p.pubKey === (roll as any).player) || 0;
            }
          });
        }
      }
    });
    // @ts-ignore
    gottenState.version = 7;
  }

  if ((gottenState.version as 7) === 7) {
    gottenState.icon = '♟';
    // @ts-ignore
    gottenState.version = 8;
  }

  return gottenState;
}
