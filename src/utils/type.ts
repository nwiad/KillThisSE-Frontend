export interface UserMetaData {
    user_id: number;
    name: string;
    register_time: string;
};

export interface Options {
    url: string, // 链接的通道的地址
    heartTime: number, // 心跳时间间隔
    heartMsg: string, // 心跳信息,默认为"ping"
    sayHi?: boolean,
    forward?: boolean, // 是否转发
    forwardMsg?: number[], // 转发的消息的id
    isReconnect: boolean, // 是否自动重连
    isDestroy: boolean, // 是否销毁
    reconnectTime: number, // 重连时间间隔
    reconnectCount: number, // 重连次数 -1 则不限制
    openCb: Function, // 连接成功的回调
    closeCb: Function, // 关闭的回调
    messageCb: Function, // 消息的回调
    errorCb: Function // 错误的回调
};

export interface ChatMetaData {  // 私聊列表显示的信息
    id: number,
    friend_id: number,
    friend_name: string,
    friend_avatar: string,
    lastMsg: string,
    time: string,
    unreadMsg: number,
    sticked: boolean,
    silent: boolean,
    disabled: boolean
};

export interface GroupChatMetaData {
    id: number,
    name: string,
    avatar: string,
    lastMsg: string,
    time: string,
    unreadMsg: number,
    sticked: boolean,
    silent: boolean,
    disabled: boolean
}

// 前端收到的消息列表的形式
export interface MsgMetaData {
    create_time: string,
    msg_id: number,
    msg_body: string,
    sender_id: number,
    sender_name: string,
    sender_avatar: string,
    is_image: boolean,
    is_file: boolean,
    is_video: boolean,
    is_audio: boolean,
    msg_to_withdraw: number,
    chosen?: boolean // 点击完确认发送就变成false ?指定为可选属性
    is_transmit: boolean,
};

export interface MemberMetaData {
    user_id: number,
    user_name: string,
    user_avatar: string,
};

export interface CovnMetaData{
    id: number,
    name: string,
    avatar: string,
    is_group: boolean,
}