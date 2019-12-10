import { Store } from 'vuex'

export const getWatchers = <RootState>(Vuex: Store<RootState>) => {
  const getWatchToGetter = (getterName: string) => {
    return (state: RootState, getters: any) => getters[getterName]
  }

  const addWatcherToState = (name: string) => (destroy: Function) => {
    Vuex.commit('relationHandlers/vuexWatchers', {
      ...Vuex.getters['relationHandlers/vuexWatchers'],
      [name]: destroy
    })
  }
  const destroyWatcher = (name: string) => (destroy: Function) => {
    destroy()
    Vuex.commit('relationHandlers/vuexWatchers', {
      ...Vuex.getters['relationHandlers/vuexWatchers'],
      [name]: null
    })
  }
  return { getWatchToGetter, addWatcherToState, destroyWatcher }
}
