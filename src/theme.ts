import { rgb } from 'd3-color';
import styled from 'styled-components';

export const meBlue = rgb(18, 65, 145);
export const meOrange = rgb(255, 149, 0);

function fontSizer(step: number) {
  const size = baseFontSize * Math.pow(ratio, step);
  return size;
}

const ratio = 1.205;
const baseFontSize = 20;

function fontSize(step: number) {
  const size = fontSizer(step);
  return `font-size: ${size}px`;
}

function rhythm(step: number) {
  const size = Math.pow(ratio, step * 4) * 1;
  return `${size}px`;
}

function grey(step: number) {
  const value = Math.round(242 - step * (242 - 51) / 5);
  return rgb(value, value, value);
}

function monochrome(c: number) {
  const value = c > 1 ? c : Math.round(255 * Math.min(1, Math.max(0, c)));
  return rgb(value, value, value);
}

export const colors = {
  blue: meBlue,
  orange: meOrange,
  darkViolet: rgb(55, 55, 100),
  mint: rgb(64, 193, 172),
  grey,
  gray: grey(0).toString(),
  darkGrey: monochrome(0.32).toString(),
  monochrome,
  apricose: rgb(255, 190, 159),
  sand: rgb(248, 229, 154),
  lila: rgb(139, 132, 215),
  bodyTextColor: rgb(51, 51, 51),
  blackText: rgb(51, 51, 51).toString(),
  greyText: monochrome(0.4).toString(),
  coral: rgb(255, 143, 125),
};

export const theme = {
  monoFontNormal: `
    font-family: Nitti;
    font-style: normal;
    font-weight: normal;
  `,
  fontLight: `
    font-family: Avenir, sans-serif;
    font-style: normal;
    font-weight: lighter;
  `,
  fontBold: `
    font-family: Avenir, sans-serif;
    font-style: normal;
    font-weight: bold;
  `,
  fontNormal: `
    font-family: Avenir, sans-serif;
    font-style: normal;
    font-weight: normal;
  `,
  rhythm,
  fontSize,
  colors,
  lightFill: `
    fill: ${colors.sand};
    opacity: 0.6
  `,

  positiveColor: colors.darkViolet,
  negativeColor: colors.apricose,
};

// (container width of 1140 matches me-säätiö's main site)
export const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  padding-left: ${theme.rhythm(4)};
  padding-right: ${theme.rhythm(4)};
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 1140px;
  @media (max-width: 600px) {
    padding-left: ${theme.rhythm(4)};
    padding-right: ${theme.rhythm(4)};
  }
`;
const defaultGutter = rhythm(4);

interface GridProps {
  gutter?: string;
}

export const Grid = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin-left: -${(props: GridProps) => props.gutter || defaultGutter};
  margin-right: -${(props: GridProps) => props.gutter || defaultGutter};
`;

/**
 * Note: IE10 and IE11 always calculate flex-basis using the content-box model,
 * meaning padding and borders aren't included. Because of this, the outermost
 * div inside a flexbox shouldn't have any padding. Hence GridCellContents below.
 * Ref: https://github.com/philipwalton/flexbugs#7-flex-basis-doesnt-account-for-box-sizingborder-box
 */
export const GridCell = styled.div`
  flex: 1 0 50%;
  overflow: hidden;
`;

interface GridCellProps {
  gutter?: string;
  width?: string;
}

export const GridCellContents = styled.div`
  padding-top: 0;
  padding-bottom: ${(props: GridCellProps) => props.gutter || defaultGutter};
  padding-right: ${(props: GridCellProps) => props.gutter || defaultGutter};
  padding-left: ${(props: GridCellProps) => props.gutter || defaultGutter};
`;
