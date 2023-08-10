import { RpgEvent, EventData, RpgPlayer, EventMode } from '@rpgjs/server'
 
@EventData({
    name: 'EV-1',
    //mode: EventMode.Scenario
})
export default class CharaEvent extends RpgEvent {
    onInit() {
        this.setGraphic('male')
        this.setHitbox(32, 32)
        this.throughOtherPlayer = true
        this.through = true
    }
    async onAction(player: RpgPlayer) {
       await player.showText('Hello ', {
            talkWith: this
       })
    }
}