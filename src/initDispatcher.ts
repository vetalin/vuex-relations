import { Store } from 'vuex'
import { IStoreMiddlewareVariables } from './interfaces'

export const getInitDispatcher = <RootState>(Vuex: Store<RootState>) => {
  const dispatchInit = ({ moduleName, initDispatch }: IStoreMiddlewareVariables) => Vuex.dispatch(`${moduleName}/${initDispatch}`, {})
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
  return { dispatchInit, moduleDidMount }
}
