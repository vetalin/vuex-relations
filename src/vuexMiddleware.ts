import { ActionWatchFunction, AvailableRelations, IStoreMiddlewareVariables } from './interfaces'
import { Store } from 'vuex'

export const addStoreRelations = <RootState>(Vuex: Store<RootState>) => {
  const registerRelationWatcher = ({ moduleName, initDispatch, watchRelations, watchActions, requiredRelations }: IStoreMiddlewareVariables): void => {
    watchToRequiredRelations({ requiredRelations, moduleName, initDispatch })
    watchToTiedRelations({ moduleName, watchRelations, initDispatch })
    watchSubscribeActions({ moduleName, initDispatch, watchActions })
  }

  const dispatchInit = ({ moduleName, initDispatch }: IStoreMiddlewareVariables) => Vuex.dispatch(`${moduleName}/${initDispatch}`, {})
  const watchToRequiredRelations = ({ requiredRelations, initDispatch, moduleName }: IStoreMiddlewareVariables) => {
    const requiredRelationsList = (() => {
      if (Array.isArray(requiredRelations)) return requiredRelations
      return requiredRelations && [requiredRelations]
    })()
    const initModule = moduleDidMount(moduleName)
    if (!requiredRelationsList || !requiredRelationsList.length) {
      initModule(() => dispatchInit({ moduleName, initDispatch }))
    } else {
      const requiredRelationWatchers = requiredRelationsList.map((relationName: string) => {
        return Vuex.watch<any>(getWatchToGetter(relationName), () => {
          const allRequiredRelations = requiredRelationsList.map((relationName: string) => {
            return !!Vuex.getters[relationName]
          })
          if (allRequiredRelations.every((relationDone: boolean) => relationDone)) {
            initModule(() => dispatchInit({ moduleName, initDispatch }))
            if (requiredRelationWatchers) { // TODO: проработать этот момент
              // сейчас иногда requiredRelationWatchers является undefined
              requiredRelationWatchers.map((destroyWatcher) => {
                destroyWatcher()
              })
            }
          }
        }, { immediate: true })
      })
    }
  }

  const moduleDidMount = (moduleName: string) => (dispatchInit: Function) => {
    Vuex.watch(
      (state: any) => state[moduleName],
      (newValue, oldValue) => {
        if (!!newValue && !oldValue) dispatchInit()
      },
      {
        immediate: true
      }
    )
  }

  const watchToTiedRelations = ({ moduleName, watchRelations }: IStoreMiddlewareVariables): void => {
    if (!watchRelations) return
    const relationsEntries = Object.entries(watchRelations)
    const relationWatchers = relationsEntries.map(([relationKey, relationValue]) => {
      const watchTo = getWatchToGetter(<AvailableRelations>relationKey)
      const watcher = Vuex.watch(watchTo, (newValue, oldValue) => {
        if (!relationValue) {
          console.warn(`relation ${relationKey} is undefined`)
          return
        }
        if (relationValue.trigger(newValue, oldValue)) {
          dispatchInit({ moduleName, initDispatch: relationValue.dispatchFunc })
        }
      }, {
        immediate: true,
        deep: true // TODO: спорное решение
      })
      addWatcherToState(relationKey)(watcher)
      return watcher
    })
  }

  const watchSubscribeActions = ({ moduleName, watchActions, initDispatch }: IStoreMiddlewareVariables) => {
    if (!watchActions) return
    const subscriber = (isBefore: boolean) => (action: any, state: any) => {
      if (!watchActions) return
      const actionName = action.type
      if (!watchActions[actionName]) return
      const send = () => {
        if (!watchActions[actionName].trigger || (watchActions[actionName].trigger as ActionWatchFunction)(action, state)) {
          dispatchInit({ moduleName, initDispatch: watchActions[actionName].dispatchFunc })
        }
      }
      const actionBefore = watchActions[actionName].beforeOrAfter === 'before'
      if (isBefore && actionBefore) {
        send()
      }
      if (!isBefore && !actionBefore) {
        send()
      }
    }
    Vuex.subscribeAction<any>({
      before: subscriber(true),
      after: subscriber(false)
    })
  }

  const getWatchToGetter = (getterName: string) => {
    return (state: RootState, getters: any) => getters[getterName]
  }

  const addWatcherToState = (name: string) => (destroy: Function) => {
    Vuex.commit('vuexWatchers', {
      ...Vuex.getters.vuexWatchers,
      [name]: destroy
    })
  }
  const destroyWatcher = (name: string) => (destroy: Function) => {
    destroy()
    Vuex.commit('vuexWatchers', {
      ...Vuex.getters.vuexWatchers,
      [name]: null
    })
  }
  return ({ moduleName, requiredRelations, watchRelations, watchActions, initDispatch }: IStoreMiddlewareVariables): void => {
    const relationHandlers = Vuex.getters.relationHandlers
    const foundRelationHandler = relationHandlers.find((relation: IStoreMiddlewareVariables) => {
      return relation.moduleName === moduleName
    })
    if (foundRelationHandler) return
    Vuex.commit('relationHandlers', [...relationHandlers, {
      moduleName,
      requiredRelations,
      watchRelations,
      initDispatch
    }])
    registerRelationWatcher({
      moduleName,
      requiredRelations,
      watchRelations,
      watchActions,
      initDispatch
    })
  }
}
