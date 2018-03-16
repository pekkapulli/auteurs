import * as React from 'react';
import { connect } from 'react-redux';
import { loadDirectorData } from '../actions';
import { Directors } from '../types';
const Sizer = require('react-sizer').default;
import styled from 'styled-components';
import '../../fonts/index.css';
import { StateTree } from '../reducers/index';
import { getDirectorData } from '../selectors/index';
import { theme } from '../theme';
import './app.scss';
import { DirectorCharts } from './director-charts/index';

interface StateProps {
  width?: number;
  height?: number;
  directorData: Directors;
}

interface DispatchProps {
  loadDirectorData: () => void;
}

type Props = DispatchProps & StateProps;

export const Main = styled.div`
  display: flex;
  min-height: 100%;
  width: 100%;
  flex-flow: column;
  background-color: #140001;
  ${theme.fontNormal};
`;

class AppVanilla extends React.Component<Props> {
  public componentDidMount() {
    this.props.loadDirectorData();
  }

  public render() {
    const { directorData, width = 960 } = this.props;
    return (
      <Main>
        {directorData ? <DirectorCharts width={width} /> : <div>'Loading'</div>}
      </Main>
    );
  }
}

export const App = connect<StateProps, DispatchProps, {}, StateTree>(
  state => ({
    directorData: getDirectorData(state),
  }),
  dispatch => ({
    loadDirectorData: () => {
      dispatch(loadDirectorData());
    },
  }),
)(Sizer()(AppVanilla) as typeof AppVanilla);
