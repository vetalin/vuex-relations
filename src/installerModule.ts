import { Store } from 'vuex'
import { RootStateDefine } from './interfaces'

export const installRelationHandlersModule = <RootState extends RootStateDefine>(Vuex: Store<RootState>) => {
  if (Vuex.state.relationHandlers) return
  Vuex.registerModule('relationHandlers', {
    state: {
      relationHandlers: [],
      vuexWatchers: []
    },
    mutations: {
      relationHandlers (state, payload) {
        state.relationHandlers = payload
      },
      vuexWatchers (state, payload) {
        state.vuexWatchers = payload
      }
    },
    getters: {
      relationHandlers (state) {
        return state.relationHandlers
      },
      vuexWatchers (state) {
        return state.vuexWatchers
      }
    }
  })
}
