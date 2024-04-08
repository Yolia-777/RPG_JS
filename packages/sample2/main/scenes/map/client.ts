export function SceneMap() {

    const playerX = signal(100)
    const playerY = signal(100)

    const controls = signal({
        'down': {
            repeat: true,
            bind: 'down',
            trigger() {
                playerY.update(y => y + 3)
            }
        },
        'up': {
            repeat: true,
            bind: 'up',
            trigger() {
                playerY.update(y => y - 3)
            }
        },
        'left': {
            repeat: true,
            bind: 'left',
            trigger() {
                playerX.update(x => x - 3)
            }
        },
        'right': {
            repeat: true,
            bind: 'right',
            trigger() {
                playerX.update(x => x + 3)
            }
        }
    })

}