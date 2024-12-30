declare module 'hyco-https' {
    import moment from '@types/moment'
    import events from 'events'
    import ws from 'ws'
    import http from 'http'


    function createRelayedServer(options: ServerOptions, requestListener: (req: http.IncomingMessage, res: ServerResponse) => void): Server
    function createRelayToken(uri: string, keyName: string, key: string, expirationSeconds?: number = 3600): string
    function appendRelayToken(uri: string, keyName: string, key: string, expirationSeconds?: number = 3600): string
    function createRelayBaseUri(serviceBusNamespace: string, path: string): string
    function createRelayHttpsUri(serviceBusNamespace: string, path: string, token?: string, id?: string): string
    function createRelaySendUri(serviceBusNamespace: string, path: string, token?: string, id?: string): string
    function createRelayListenUri(serviceBusNamespace: string, path: string, token?: string, id?: string): string

    class Server extends events.EventEmitter<ServerEventMap> {
        constructor(options: ServerOptions, requestListener)
        listenUri: string
        pendingRequest = null
        closeRequested: boolean
        options: ServerOptions
        path: string
        clients: Array<ws.WebSocket>
        timeout: number
        setTimeout(msecs: number, callback: () => void)
        listen()
        close(callback: (e: Error) => void)
    }

    type ServerEventMap = {
        request: [http.IncomingMessage, http.ServerResponse]
        requestchannel: [ws.WebSocket]
        error: [ws.ErrorEvent]
        listening: []
        timeout: []
        close: [Server]
        headers: [http.IncomingMessage["headers"]]
        connection: [ws.WebSocket]
    }

    type ServerOptions = {
        server: string
        token: string | (() => string)
        path?: string
        id?: string
        keepAliveTimeout?: moment.duration
    }

}