// Jog wheel handling for nanoKONTROL Studio

import { JogControls } from './cc-mappings';

export function handleJogControl(
  control: JogControls,
  value: number,
  transport: API.Transport,
  shiftPressed: boolean = false
): void {
  if (shiftPressed) {
    const tempoChange = 0.5 * value;

    if (control === JogControls.DEC) {
      changeTempo(-tempoChange, transport);
    } else if (control === JogControls.INC) {
      changeTempo(tempoChange, transport);
    }
  } else {
    const resolution = (1 / 16) * value;

    if (control === JogControls.DEC) {
      changePlayPosition(-1, resolution, transport);
    } else if (control === JogControls.INC) {
      changePlayPosition(1, resolution, transport);
    }
  }
}

function changePlayPosition(
  direction: number,
  resolution: number,
  transport: API.Transport
): void {
  const currentPosition = transport.playStartPosition().get();
  let newPosition = currentPosition + resolution * direction;

  // Don't allow negative positions
  if (newPosition < 0) {
    newPosition = 0;
  }

  if (currentPosition !== newPosition) {
    const quantizedPosition = Math.floor(newPosition / resolution) * resolution;
    transport.playStartPosition().set(quantizedPosition);

    if (transport.isPlaying().get()) {
      transport.jumpToPlayStartPosition();
    }
  }
}

function changeTempo(tempoChange: number, transport: API.Transport): void {
  const currentTempo = transport.tempo().getRaw();
  let newTempo = currentTempo + tempoChange;

  if (newTempo < 10) {
    newTempo = 10;
  } else if (newTempo > 400) {
    newTempo = 400;
  }

  if (Math.abs(currentTempo - newTempo) >= 0.1) {
    transport.tempo().setRaw(newTempo);
  }
}
