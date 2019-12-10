import { addStoreRelations } from './addStoreRelations'
import { Store } from 'vuex'
import { RootStateDefine } from './interfaces'

export const addStoreRelationsInit = <RootState extends RootStateDefine>(Vuex: Store<RootState>) => {
  return addStoreRelations<RootState>(Vuex)
}
