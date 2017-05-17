
import * as React from "react";
import {connect, I18nProps} from "./connect";
import {createStructuredSelector} from "reselect";

import {TabLayout} from "../types";
import Game from "../models/game";

import GameGrid from "./game-grid";
import GameTable from "./game-table";

import {ISortParams, SortDirectionType} from "./sort-types";

import styled from "./styles";

export const HubGamesDiv = styled.div`
  flex-grow: 1;
`;

class Games extends React.Component<IProps & IDerivedProps & I18nProps, IState> {
  constructor () {
    super();
    this.state = {
      sortBy: null,
      sortDirection: null,
    };

    this.onSortChange = this.onSortChange.bind(this);
  }

  onSortChange(params: ISortParams) {
    let {sortBy, sortDirection} = params;

    if (sortBy !== this.state.sortBy) {
      // sorting by different column
      if (sortBy === "secondsRun" || sortBy === "lastTouchedAt") {
        // default to desc for these, which makes the most sense
        sortDirection = "DESC";
      }
    }

    this.setState({sortBy, sortDirection});
  }

  render() {
    const {games, hiddenCount, tab, layout} = this.props;
    const {sortBy, sortDirection} = this.state;

    if (layout === "grid") {
      return <GameGrid
        games={games}
        hiddenCount={hiddenCount}
        tab={tab}/>;
    } else if (layout === "table") {
      return <GameTable
        games={games}
        hiddenCount={hiddenCount}
        tab={tab}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={this.onSortChange}/>;
    } else {
      return <div>Unknown layout {layout}</div>;
    }
  }
}

interface IProps {
  tab: string;
  games: Game[];
}

interface IDerivedProps {
  layout: TabLayout;
  hiddenCount: number;
}

interface IState {
  sortBy?: string;
  sortDirection?: SortDirectionType;
}

export default connect<IProps>(Games, {
  state: createStructuredSelector({
    layout: (state) => state.preferences.layout,
  }),
});