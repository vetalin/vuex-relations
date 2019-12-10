export type WatchFunction = <T>(newValue: T, oldValue: T) => boolean
export type ActionWatchFunction = (action: any, state: any) => boolean

export interface IRelationDesc {
  trigger: WatchFunction
  dispatchFunc: string
}

export interface IActionRelationDesc {
  trigger?: ActionWatchFunction
  dispatchFunc: string
  beforeOrAfter?: 'before' | 'after' // default is 'after'
}

export type AvailableRelations = 'currentClubId'

export interface IStoreRelationships {
  [key: string]: IRelationDesc | undefined
}

export interface IStoreActionsSubscribe {
  [key: string]: IActionRelationDesc
}

export interface IStoreMiddlewareVariables {
  requiredRelations?: AvailableRelations | AvailableRelations[]
  watchRelations?: IStoreRelationships
  watchActions?: IStoreActionsSubscribe
  moduleName: string
  initDispatch: string
}

export type RootStateDefine = {
  [key: string]: any,
  relationHandlers: IStoreMiddlewareVariables[]
}
