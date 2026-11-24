import './localization';
import { initMapSelector } from './mapSelector';
import options from './options';
import { Roulette } from './roulette';

const roulette = new Roulette();
Object.assign(window, {
  roulette,
  options,
  initMapSelector(onMapChange: () => void, toast: (key: string) => void) {
    return initMapSelector({ roulette, onMapChange, toast, apiBase: 'https://marblerouletteshop.com' });
  },
});
