import { RpgCommonMap, Utils }  from '@rpgjs/common'
import fs from 'fs'
import { Schema } from '@rpgjs/sync-server'
import { RpgPlayer } from '../Player/Player';

@Schema({
    users: [RpgPlayer.schemas]
})
export class RpgMap extends RpgCommonMap {

    public events: any
    public id: any
    public file: any 
    public _events: any[] = []

    constructor(private _server: any) {
        super()
    }

    async load() {
        if (RpgCommonMap.buffer.has(this.id)) {
            return 
        }
        const data = await this.parseFile() 
        super.load(data) 
        RpgCommonMap.buffer.set(this.id, this)
        this._events = this.createEvents('sync')
        this.onLoad()
    }

    get game() {
        return this._server.gameEngine
    }

    onLoad() {}

    createEvents(type, player?) {
        const events: any[] = []

        if (!this.events) return events

        for (let obj of this.events) {

            let event: any, position

            if (obj.x === undefined) {
                event = obj
            }
            else {
                event = obj.event
                position = { x: obj.x, y: obj.y }
            }

            if (event.syncAll == false && type == 'sync') {
                continue
            }
            if (event.syncAll == true && type == 'nosync') {
                continue
            }

            const ev = this.game.addEvent(event, event.syncAll)

            if (!position) position = this.getPositionByShape(shape => shape.type == 'event' && shape.name == ev.name)
            if (!position) position = { x: 0, y: 0 }

            ev.width = event.width || this.tileWidth
            ev.height = event.height || this.tileHeight
            if (event.hitbox) ev.setHitbox(event.hitbox.width, event.hitbox.height)
            
            ev.map = this.id
            ev.setPosition(position)
            ev.speed = 1
            ev.server = this._server

            if (event.syncAll == true) {
                this._server.assignObjectToRoom(ev, this.id)
            }

            if (ev.onInit && event.syncAll) {
                ev.execMethod('onInit', [player])
            }

            events.push(ev)     
        }

        return events
    }

    parseFile() {   
        if (this.file.version) {
            return Promise.resolve(this.file)
        }

        if (Utils.isBrowser()) {
            return fetch(this.file)
                .then(res => res.json())
        }

        const filepath = this._server.inputOptions.basePath + '/' + this.file
        
        return new Promise((resolve, reject) => {
            fs.readFile(filepath, 'utf-8', (err, data) => {
                if (err) return reject(err)
                resolve(JSON.parse(data))
            })
        })
    }
}