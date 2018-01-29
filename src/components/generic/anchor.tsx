import * as React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

interface AnchorProps {
  href: string;
  target?: string;
  children: JSX.Element | JSX.Element[] | string;
}

export const AnchorRoot = styled.a`
  color: ${theme.colors.grey(5).toString()};
  color: ${theme.colors.blue.toString()};
  padding-bottom: 2px;
  border-bottom: 1.25px dotted ${theme.colors.blue.toString()};
  text-decoration: none;
`;

export const AnchorInner = styled.span``;

export const Anchor = ({ href, target, children }: AnchorProps) => (
  <AnchorRoot href={href} target={target}>
    <AnchorInner>{children}</AnchorInner>
  </AnchorRoot>
);
