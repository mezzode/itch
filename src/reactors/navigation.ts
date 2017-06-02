
import * as actions from "../actions";
import {Watcher} from "./watcher";

import {createSelector} from "reselect";

import staticTabData from "../constants/static-tab-data";

import {IAppState, IStore} from "../types";

let pathSelector: (state: IAppState) => void;
const makePathSelector = (store: IStore) => createSelector(
  (state: IAppState) => state.session.navigation.id,
  (id) => {
    setImmediate(() => {
      store.dispatch(actions.tabChanged({id}));
    });
  },
);

export default function (watcher: Watcher) {
  watcher.on(actions.clearFilters, async (store, action) => {
    store.dispatch(actions.updatePreferences({onlyCompatibleGames: false}));
  });

  watcher.on(actions.navigate, async (store, action) => {
    const state = store.getState();
    const {id} = action.payload;

    const {tabData} = state.session;

    if (staticTabData[id]) {
      // switching to constant tab, that's good
      store.dispatch(actions.focusTab({id}));
      return;
    }
    
    if (tabData[id]) {
      // switching to existing tab by id - that's fine
      store.dispatch(actions.focusTab({id}));
      return;
    }
    
    for (const tabId of Object.keys(tabData)) {
      if (tabData[tabId].path === id) {
        // switching by path is cool
        store.dispatch(actions.focusTab({id: tabId}));
        return;
      }
    }

    const {data, background} = action.payload;

    // must be a new tab then!
    store.dispatch(actions.openTab({
      background,
      data: {
        path: id,
        ...data,
      },
    }));
  });

  watcher.on(actions.evolveTab, async (store, action) => {
    const {id, path, extras} = action.payload;

    // TODO: is this something fetchers should take care of?
    store.dispatch(actions.tabEvolved({
      id,
      data: {
        path,
        ...extras,
      },
    }));
  });

  watcher.on(actions.closeAllTabs, async (store, action) => {
    const {transient} = store.getState().session.navigation.tabs;

    // woo !
    for (const id of transient) {
      store.dispatch(actions.closeTab({id}));
    }
  });

  watcher.onAll(async (store, action) => {
    if (!pathSelector) {
      pathSelector = makePathSelector(store);
      pathSelector = createSelector(
        (state: IAppState) => state.session.navigation.id,
        (id) => {
          setImmediate(() => {
            store.dispatch(actions.tabChanged({id}));
          });
        },
      );
    }
    pathSelector(store.getState());
  });
}