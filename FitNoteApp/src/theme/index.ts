import tokens from '../../tokens.json';

export type Theme = typeof tokens;
export const theme: Theme = tokens as Theme;

export const t = {
  color: {
    primary: (shade: keyof typeof tokens.color.primary = '500') =>
      (tokens.color.primary as any)[shade] as string
  }
};
