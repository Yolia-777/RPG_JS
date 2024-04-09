import { Components, Move, RpgPlayer, RpgPlayerHooks } from '@rpgjs/server';

const player: RpgPlayerHooks = {
    onConnected(player: RpgPlayer) {
        player.name = 'YourName'
        player.setComponentsTop(Components.text('{position.x},{position.y}'))
        
    },
    onInput(player: RpgPlayer, { input }) {
        const map = player.getCurrentMap()
        if (input == 'action') {
            const gui = player.gui('test')
            gui.open({ gold: 10 })
            // const event = map?.createDynamicEvent({
            //     x: player.position.x + 5,
            //     y: player.position.y + 5,
            //     event: CharaEvent,
            // });
        }
        if (input == 'back') {
           player.callMainMenu()
        }
    },
    async onJoinMap(player: RpgPlayer, map) {
        player.gui('test').open();
        const event = map.getEventByName('EV-1') as any
        event.speed = 1
        event.infiniteMoveRoute([Move.tileRandom()])
    }
}

export default player