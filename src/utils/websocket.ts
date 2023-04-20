let websocket: WebSocket, lockReconnect: boolean = false;
let msg: string;
const createWebSocket = (url: string) => {
    websocket = new WebSocket(url);
    websocket.onopen = function () {
        console.log("connected");
        heartCheck.reset().start();
    };
    websocket.onerror = function () {
        console.log("reconnecting");
        reconnect(url);
    };
    websocket.onclose = function (e) {
        console.log("websocket 断开: " + e.code + " " + e.reason + " " + e.wasClean);
        console.log("reconnecting");
        reconnect(url);
    };
    websocket.onmessage = function (event) {
        //lockReconnect=true;
        console.log(event.data);
        //event 为服务端传输的消息，在这里可以处理
        //console.log(typeof(event.data));
        msg = JSON.parse(event.data).message;
        console.log(msg);
    };
};
const reconnect = (url: string) => {
    if (lockReconnect) return;
    lockReconnect = true;
    //没连接上会一直重连，设置延迟避免请求过多
    setTimeout(function () {
        createWebSocket(url);
        lockReconnect = false;
    }, 4000);
};
let heartCheck = {
    timeout: 60000, //60秒
    timeoutObj: null as NodeJS.Timeout | null,
    reset: function () {
        clearInterval(this.timeoutObj!);
        return this;
    },
    start: function () {
        this.timeoutObj = setInterval(function () {
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            //onmessage拿到返回的心跳就说明连接正常
            if(websocket.readyState === 1) {
                //websocket.send("{\"message\": \"heartbeat\"}");
                console.log("heartbeat");                
            }
            else{
                closeWebSocket();
            }
        }, this.timeout);
    }
};
//关闭连接
const closeWebSocket=()=> {
    websocket && websocket.close();
};

export {
    websocket,
    msg,
    createWebSocket,
    closeWebSocket
};

