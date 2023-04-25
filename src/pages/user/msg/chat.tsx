import { useEffect, useState, useRef } from "react";
import Navbar from "../navbar";
import { useRouter } from "next/router";
import { Socket } from "../../../utils/websocket";
import { Options } from "../../../utils/type";

const ChatScreen = () => {
    const [msgList, setMsgList] = useState<string[]>();
    const router = useRouter();
    const query = router.query;

    const socket = useRef<Socket>();

    const fetchList = () => {

    };
    
    useEffect(() => {
        if(!router.isReady) {
            return;
        }
        
        const options: Options = {
            url: `ws://localhost:8000/chat/${query.id}`,
            heartTime: 5000, // 心跳时间间隔
            heartMsg: "{\"message\": \"heartbeat\"}", // 心跳信息,默认为"ping"
            isReconnect: true, // 是否自动重连
            isDestroy: false, // 是否销毁
            reconnectTime: 5000, // 重连时间间隔
            reconnectCount: -1, // 重连次数 -1 则不限制
            openCb: () => { }, // 连接成功的回调
            closeCb: () => { }, // 关闭的回调
            messageCb: () => { }, // 消息的回调
            errorCb: () => { } // 错误的回调
        };
        socket.current = new Socket(options);
        // todo: 获取消息列表
        return (() => {
            socket.current?.destroy();
        });
    }, [router, query]);

    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <div>
                {/*todo: 显示所有消息 */}
            </div>
        </div>
    );
};

export default ChatScreen;