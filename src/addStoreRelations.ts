import { IStoreMiddlewareVariables, RootStateDefine } from './interfaces'
import { Store } from 'vuex'
import { getWatchRegister } from './watchRegister'
import { installRelationHandlersModule } from 'src/installerModule'

export const addStoreRelations = <RootState extends RootStateDefine>(Vuex: Store<RootState>) => {
  installRelationHandlersModule<RootState>(Vuex)
  const {registerRelationWatcher} = getWatchRegister<RootState>(Vuex)

  return ({ moduleName, requiredRelations, watchRelations, watchActions, initDispatch }: IStoreMiddlewareVariables): void => {
    const relationHandlers = Vuex.getters['relationHandlers/relationHandlers']
    const foundRelationHandler = relationHandlers.find((relation: IStoreMiddlewareVariables) => {
      return relation.moduleName === moduleName
    })
    if (foundRelationHandler) return
    Vuex.commit('relationHandlers/relationHandlers', [...relationHandlers, {
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
