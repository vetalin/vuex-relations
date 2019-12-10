import { addStoreRelations } from './vuexMiddleware'
import { Store } from 'vuex'

export const addStoreRelationsInit = <RootState>(Vuex: Store<RootState>) => {
  return addStoreRelations<RootState>(Vuex)
}
