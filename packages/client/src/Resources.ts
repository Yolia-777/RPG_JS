import { RpgClientEngine } from "./RpgClientEngine";
/**
* Get/Set images in resources
 ```ts
    import { RpgResource } from '@rpg/client'
    const fileLink = RpgResource.spritesheets.get('resource_id')
  ```
* @title Get/Set image link
* @prop { Map< string, string > } spritesheets
* @memberof Resources
*/
/**
* Get/Set sounds in resources
 ```ts
    import { RpgResource } from '@rpg/client'
    const fileLink = RpgResource.sounds.get('resource_id')
  ```
* @title Get/Set sound link
* @prop { Map< string, string > } sounds
* @memberof Resources
*/
export async function _initResource(
  memory: Map<string, any>,
  _resources,
  prop: string,
  engine: RpgClientEngine
) {
  for (let resource of _resources) {
    const pluralProp = prop + "s";
    const propDecorator = resource.$decorator[pluralProp]
    if (propDecorator && !resource.$decorator[prop]) {
      for (let key in propDecorator) {
        const instance = new resource();
        instance.$decorator = resource.$decorator;
        instance.$decorator[prop] = engine.getResourceUrl(propDecorator[key]);
        delete instance.$decorator[pluralProp];
        instance.id = instance.$decorator.id = key;
        memory.set(key, instance);
      }
    } else {
      const instance = new resource(engine);
      const id = resource.$decorator.id
      if (!id) {
        throw new Error(`Resource ${resource[prop]} must have an id`);
      }
      instance.$decorator = resource.$decorator;
      instance.$decorator[prop] = engine.getResourceUrl(instance.$decorator[prop]);
      memory.set(id, instance);
    }
  }
}

export const spritesheets: Map<string, any> = new Map();

export function _initSpritesheet(_spritesheets, engine: RpgClientEngine) {
  return _initResource(spritesheets, _spritesheets, "image", engine);
}
