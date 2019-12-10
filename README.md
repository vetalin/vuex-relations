# addStoreRelations

Функция позволяет накрутить хайтек в `Vuex store` такой, какой не снилось.

В проекте были встречены проблемы синхронизации `actions` и `mutations` между `store` модулями.
Так же был всякий ненужный бойлерплейт, как например подтягивание данных с сервера в `created` хуке компонента, регистрирующего `store` модуль.

В результате явилась миру эта функция.

## arguments

Функция принимает как аргумент объект следующего вида: 

```typescript
    interface IStoreMiddlewareVariables {
      requiredRelations?: AvailableRelations | AvailableRelations[]
      watchRelations?: IStoreRelationships
      watchActions?: IStoreActionsSubscribe
      moduleName: string
      initDispatch: string
    }
 
    //, где

    type WatchFunction = <T>(newValue: T, oldValue: T) => boolean
    type ActionWatchFunction = (action: any, state: any) => boolean
    
    interface IRelationDesc {
      trigger: WatchFunction
      dispatchFunc: string
    }
    
    interface IActionRelationDesc {
      trigger?: ActionWatchFunction
      dispatchFunc: string
      beforeOrAfter?: 'before' | 'after' // по дефолту стоит 'after'
    }
    
    type AvailableRelations = 'currentClubId'
    
    export interface IStoreRelationships {
      [key: string]: IRelationDesc | undefined
    }
    
    export interface IStoreActionsSubscribe {
      [key: string]: IActionRelationDesc
    }  

```

+ `moduleName` - имя `store` модуля, к которому подвяжутся зависимости
+ `initDispatch` - имя `action`, который запустится после создания экземпляра компонента,
    к которому привязан `store` модуль. Сюда чаще всего идут запросы к серверу, по подтягиванию данных для
    таблиц и тд и тп
+ `requiredRelations` - `state`, который обязательно должен существовать, прежде чем запустится `initDispatch` и все остальное,
    в случае, если этот `state`, по какой-либо причине не будет существовать, `initDispatch` дождется его появления, прежде чем запустится.
    Пока что это все сделано только для `currentClubId`, но если понадобится для чего-то ещё, то можно дописать
+ `watchRelations` - триггеры, после которых нужно запустить функцию, переданную сюда в качестве аргумента `dispatchFunc`
+ `watchActions` - `actions`, после (или до) которых нужно запускать `dispatchFunc`, переданную сюда в качестве аргумента

## Пример

Пример использования в модуле "Герои и группы":

```typescript
    import { addStoreRelations } from '@/utils/helpers/vuexMiddleware'  
    import { getDefaultWatchTrigger } from '@/store/defaultWatchTriggers'
    import { moduleName } from '@/views/App/Heroes/store/index'

    addStoreRelations({
      moduleName,
      initDispatch: 'getOptions',
      watchRelations: {
        ...getDefaultWatchTrigger('currentClubId', 'getOptions')
      },
      watchActions: {
        'quickEditorChild/createChild': {
          dispatchFunc: 'getOptions',
          beforeOrAfter: 'after'
        }
      },
      requiredRelations: 'currentClubId'
    })
```

Пример триггера на дефолтном триггере для `currentClubId`:
```typescript
      import { IStoreRelationships } from '@/utils/helpers/vuexMiddleware'
      
      type WatchTriggers = 'currentClubId'
      
      export const getDefaultWatchTrigger = (name: WatchTriggers, dispatchFunc: string): IStoreRelationships => {
        return {
          [name]: {
            dispatchFunc,
            trigger: (() => {
              switch (name) {
                case 'currentClubId':
                  return defaultCurrentClubIdTrigger
              }
            })()
          }
        }
      }
      
      export const defaultCurrentClubIdTrigger = (newValue: any, oldValue: any) => {
        return newValue !== oldValue && !!newValue && !!oldValue
      }
```
    
В этом примере после создания основного компонента "Герои и группы", к которому привязан `store`, будет запущен `action` `getOptions`,
который подтягивает все необходимые данные с сервера, НО, `getOptions` дождется, пока `currentClubId` придет с сервера в `state`,
а уже потом подтянет все, что нужно.

После создания нового героя запустится `action` `getOptions` для обновления данных в таблице и тд.

И после смены клуба `currentClubId` администратором также запустится `action` `getOptions`, для обновления всех
необходимых данных для нового клуба.

В итоге получилась понятный переиспользуемый метод для подобных вещей.