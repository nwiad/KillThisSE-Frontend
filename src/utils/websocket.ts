import { Heart } from "./heart";

import { Options } from "./type";

const LOCAL = "ws://localhost:8000/ws/chat/"; // 测试环境
const REMOTE = "wss://2023-im-backend-killthisse.app.secoder.net/ws/chat/"; // 正式环境

export const suffix = LOCAL;
// export const suffix = REMOTE;

export class Socket extends Heart {
    ws: WebSocket|undefined;

    RECONNECT_TIMER: NodeJS.Timeout|undefined; // 重连计时器
    RECONNECT_COUNT: number = 10; // 变量保存，防止丢失

    OPTIONS: Options = {
        url: "", // 链接的通道的地址
        heartTime: 5000, // 心跳时间间隔
        heartMsg: JSON.stringify({message: "ping", token: localStorage.getItem("token"), heartbeat: true}), // 心跳信息,默认为"ping"
        sayHi: false,
        isReconnect: true, // 是否自动重连
        isDestroy: false, // 是否销毁
        reconnectTime: 5000, // 重连时间间隔
        reconnectCount: 5, // 重连次数 -1 则不限制
        openCb: () => {}, // 连接成功的回调
        closeCb: () => {}, // 关闭的回调
        messageCb: () => {}, // 消息的回调
        errorCb: () => {} // 错误的回调
    };

    constructor (ops: Options) {
        super();
        Object.assign(this.OPTIONS, ops);
        this.create();
    }
    /**
     * 建立连接
     */
    create () {
        if (!("WebSocket" in window)) {
        /* eslint-disable no-new */
            throw new Error("当前浏览器不支持，无法使用");
        }
        if (!this.OPTIONS.url) {
            throw new Error("地址不存在，无法建立通道");
        }
        delete this.ws;
        this.ws = new WebSocket(this.OPTIONS.url);
        this.onopen();
        this.onclose();
        this.onmessage();
    }
    /**
     * 自定义连接成功事件
     * 如果callback存在，调用callback，不存在调用OPTIONS中的回调
     * @param {Function} callback 回调函数
     */
    onopen (callback?: Function) {
        if(this.ws === undefined) {
            console.log("onopen: ws is undefined");
            return;
        }
        this.ws!.onopen = (event) => {
            console.log("WebSocket 已连接", this.OPTIONS.url);
            if(this.OPTIONS.sayHi === true) {
                this.send(JSON.stringify({
                    message: "我通过了你的好友申请，我们开始聊天吧！", token: localStorage.getItem("token"),
                    is_image: false, is_file: false, is_video: false
                }));
            }
            else if(this.OPTIONS.forward === true && this.OPTIONS.forwardMsg !== undefined) {
                console.log("我转发了: "+this.OPTIONS.forwardMsg);
                this.send(JSON.stringify({
                    message: this.OPTIONS.forwardMsg, token: localStorage.getItem("token"),
                    is_image: false, is_file: false, is_video: false, forward: true
                }));
            }
            clearTimeout(this.RECONNECT_TIMER); // 清除重连定时器
            this.OPTIONS.reconnectCount = this.RECONNECT_COUNT; // 计数器重置
            // 建立心跳机制
            super.reset().start(() => {
                console.log("发送心跳");
                this.send(this.OPTIONS.heartMsg);
            });
            if (typeof callback === "function") {
                callback(event);
            } else {
                (typeof this.OPTIONS.openCb === "function") && this.OPTIONS.openCb(event);
            }
        };
    }
    /**
     * 自定义关闭事件
     * 如果callback存在，调用callback，不存在调用OPTIONS中的回调
     * @param {Function} callback 回调函数
     */
    onclose (callback?: Function) {
        if(this.ws === undefined) {
            console.log("onclose: ws is undefined");
            return;
        }
        this.ws!.onclose = (event) => {
            console.log("WebSocket 已关闭" + " " + event.code + " " + event.reason + " " + event.wasClean);
            if(this.OPTIONS.forward === true || this.OPTIONS.sayHi === true) {
                return;
            }
            super.reset();

            !this.OPTIONS.isDestroy && this.onreconnect();
            if (typeof callback === "function") {
                callback(event);
            } else {
                (typeof this.OPTIONS.closeCb === "function") && this.OPTIONS.closeCb(event);
            }
        };
    }
    /**
     * 自定义错误事件
     * 如果callback存在，调用callback，不存在调用OPTIONS中的回调
     * @param {Function} callback 回调函数
     */
    onerror (callback?: Function) {
        if(this.ws === undefined) {
            console.log("onerror: ws is undefined");
            return;
        }
        this.ws!.onerror = (event) => {
            if (typeof callback === "function") {
                callback(event);
            } else {
                (typeof this.OPTIONS.errorCb === "function") && this.OPTIONS.errorCb(event);
            }
        };
    }
    /**
     * 自定义消息监听事件
     * 如果callback存在，调用callback，不存在调用OPTIONS中的回调
     * @param {Function} callback 回调函数
     */
    onmessage (callback?: Function) {
        if(this.ws === undefined) {
            console.log("onmessage: ws is undefined");
            return;
        }
        this.ws!.onmessage = (event) => {
            // 收到任何消息，重新开始倒计时心跳检测
            // console.log(JSON.parse(event.data).messages);
            super.reset().start(() => {
                console.log("发送心跳");
                this.send(this.OPTIONS.heartMsg);
            });
            if (typeof callback === "function") {
                callback(event);  // 函数签名可能需要修改
            } else {
                (typeof this.OPTIONS.messageCb === "function") && this.OPTIONS.messageCb(event);
            }
        };
    }
    /**
     * 自定义发送消息事件
     * @param {String} data 发送的文本
     */
    send (data: string) {
        if (this.ws!.readyState !== this.ws!.OPEN) {
            // throw new Error("没有连接到服务器，无法推送");
        }
        this.ws!.send(data);
    }
    /**
     * 连接事件
     */
    onreconnect () {
        if (this.OPTIONS.reconnectCount > 0 || this.OPTIONS.reconnectCount === -1) {
            this.RECONNECT_TIMER = setTimeout(() => {
                this.create();
                if (this.OPTIONS.reconnectCount !== -1) this.OPTIONS.reconnectCount--;
            }, this.OPTIONS.reconnectTime);
        } else {
            clearTimeout(this.RECONNECT_TIMER);
            this.OPTIONS.reconnectCount = this.RECONNECT_COUNT;
        }
    }
    /**
     * 销毁
     */
    destroy () {
        super.reset();
        clearTimeout(this.RECONNECT_TIMER); // 清除重连定时器
        this.OPTIONS.isDestroy = true;
        this.ws!.close();
    }
}