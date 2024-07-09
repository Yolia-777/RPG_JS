import { Hono } from 'hono'

export async function honoServer() {
    const app = new Hono()
    app.get('/', (c) => c.text('Hono!'))
    return {
        app
    }
}

export default honoServer