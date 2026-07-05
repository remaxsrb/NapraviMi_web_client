import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Palette pulled from the beaded keychain: red diamond thread as the brand/
 * primary color, sage tip-accents standing in for PrimeNG's "success" green,
 * and a warm neutral ramp (canvas white → ink black) replacing the default
 * cool slate/zinc surface scale.
 */
const RED = {
  50: '#fdf2f3',
  100: '#fae1e3',
  200: '#f4bec3',
  300: '#eb8e97',
  400: '#e1515f',
  500: '#b21f2d',
  600: '#8b1823',
  700: '#641119',
  800: '#410b10',
  900: '#230609',
  950: '#1a0405',
};

const SAGE = {
  50: '#f8f9f6',
  100: '#eef1e9',
  200: '#dbe1d1',
  300: '#c0cbaf',
  400: '#9eae84',
  500: '#93a575',
  600: '#7c8f5d',
  700: '#64734b',
  800: '#4f5a3b',
  900: '#3c452d',
  950: '#292f1f',
};

const SURFACE = {
  0: '#ffffff',
  50: '#f7f6f6',
  100: '#ecebe9',
  200: '#dbd9d6',
  300: '#c3bfbb',
  400: '#a6a19b',
  500: '#878078',
  600: '#67615b',
  700: '#4c4743',
  800: '#33302e',
  900: '#201f1d',
  950: '#171614',
};

export const NapraviMiPreset = definePreset(Aura, {
  primitive: {
    red: RED,
    green: SAGE,
  },
  semantic: {
    primary: RED,
    colorScheme: {
      light: {
        surface: SURFACE,
      },
      dark: {
        surface: SURFACE,
      },
    },
  },
});
