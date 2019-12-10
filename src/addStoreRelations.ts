import { IStoreMiddlewareVariables } from './interfaces'
import { Store } from 'vuex'
import { getWatchRegister } from './watchRegister'

export const addStoreRelations = <RootState>(Vuex: Store<RootState>) => {
  const {registerRelationWatcher} = getWatchRegister<RootState>(Vuex)

  return ({ moduleName, requiredRelations, watchRelations, watchActions, initDispatch }: IStoreMiddlewareVariables): void => {
    const relationHandlers = Vuex.state.relationHandlers
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
