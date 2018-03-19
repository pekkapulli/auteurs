import * as React from 'react';
import { connect } from 'react-redux';
import { loadDirectorData } from '../actions';
import { Directors } from '../types';
const Sizer = require('react-sizer').default;
const scrollama = require('scrollama') as any;
import { selectAll } from 'd3-selection';
import 'intersection-observer';
const stickyfill = require('stickyfilljs');
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

interface State {
  showCareers: boolean;
  sticky: boolean;
  onlyHits: boolean;
  onlyShawshank: boolean;
}

export const Main = styled.div`
  display: flex;
  min-height: 30000px;
  width: 100%;
  flex-flow: column;
  background-color: #140b00;
  ${theme.fontNormal};
`;

const Header = styled.div`
  width: 100%;
  margin: ${theme.rhythm(7)} 0;
  text-align: center;
`;

const Title = styled.div`
  ${theme.fontSize(4)};
  ${theme.fontNormal};
  margin: 0 auto;
  color: #fffff2;
`;

const TextContent = styled.div`
  margin-top: 1000px;
  color: white;
`;

const Scroll = styled.div`
  position: relative;
`;

const ScrollGraphic = styled.div`
  position: sticky;
  top: 0;
  left: 30%;
  width: 70%;
  bottom: auto;

  .is-fixed {
    position: fixed;
  }

  .is-bottom {
    bottom: 0;
    top: auto;
  }
`;

const ScrollText = styled.div`
  position: relative;
  width: 29%;
`;

interface Result {
  direction: string;
  element: any;
  index: any;
}

class AppVanilla extends React.Component<Props, State> {
  private scroller: any;
  private graphicRef?: HTMLDivElement;

  constructor(props: Props) {
    super(props);
    this.state = {
      showCareers: false,
      sticky: true,
      onlyHits: true,
      onlyShawshank: true,
    };
  }

  private handleStepEnter = (result: Result) => {
    if (result.direction === 'down') {
      switch (result.index) {
        case 0:
          this.setState({ onlyShawshank: false });
          break;
        case 1:
          this.setState({ onlyHits: false });
          break;
        case 2:
          this.setState({ showCareers: true, sticky: false });
          break;
      }
    }
  };

  private handleStepExit = (result: Result) => {
    if (result.direction === 'up') {
      switch (result.index) {
        case 0:
          this.setState({ onlyShawshank: true });
          break;
        case 1:
          this.setState({ onlyHits: true });
          break;
        case 2:
          this.setState({ showCareers: false, sticky: true });
          break;
      }
    }
  };

  private handleContainerEnter = (_result: any) => {
    // console.log('enter,', result);
  };

  private handleContainerExit = (_result: any) => {
    // console.log('exit,', result);
  };

  public componentDidMount() {
    this.props.loadDirectorData();
    this.scroller = scrollama();
    this.scroller
      .setup({
        step: '.scroll__text .step', // required
        container: '.scroll', // required (for sticky)
        graphic: '.scroll__graphic', // required (for sticky)
        offset: 0.6,
      })
      .onStepEnter(this.handleStepEnter)
      .onStepExit(this.handleStepExit)
      .onContainerEnter(this.handleContainerEnter)
      .onContainerExit(this.handleContainerExit);
    selectAll('.sticky').each(() => {
      stickyfill.add(this);
    });
  }

  public render() {
    const { directorData, width = 960 } = this.props;
    const { showCareers, sticky, onlyHits, onlyShawshank } = this.state;
    return (
      <Main>
        <Header>
          <Title>Auteurs</Title>
        </Header>
        <Scroll className="scroll">
          <ScrollGraphic
            ref={(ref: any) => (this.graphicRef = ref!)}
            className={`scroll__graphic sticky${sticky ? ' is-fixed' : ''}`}
          >
            {directorData ? (
              <DirectorCharts
                width={width * 0.7}
                marginLeft={5}
                marginRight={5}
                showCareers={showCareers}
                onlyHits={onlyHits}
                onlyShawshank={onlyShawshank}
              />
            ) : (
              <div>'Loading'</div>
            )}
          </ScrollGraphic>
          <ScrollText className="scroll__text">
            <div className="step" data-step="a">
              <TextContent>Hits only</TextContent>
            </div>
            <div className="step" data-step="b">
              <TextContent>All movies</TextContent>
            </div>
            <div className="step" data-step="c">
              <TextContent>Careers</TextContent>
            </div>
          </ScrollText>
        </Scroll>
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
