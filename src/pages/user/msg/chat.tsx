import { useEffect, useState, useRef } from "react";
import Navbar from "../navbar";
import { useRouter } from "next/router";
import { Socket } from "../../../utils/websocket";
import { Options } from "../../../utils/type";

const magic = "1A2b3c4D5e6F7g8H9i0J1k2L3m4N5o6P7q8R9s0T1u2V3w4X5y6Z7a8B9c0D1e2F3g4H5i6J7k8L9m0N1o2P3q4R5s6T7u8V9w0X1y2Z3a4B5c6D7e8F9g0H1i2J3k4L5m6N7o8P9q0R1s2T3u4V5w6X7y8Z9a0B1c2D3e4F5g6H7i8J9k0L1m2N3o4P5q6R7s8T9u0V1w2X3y4Z5a6B7c8D9e0F1g2H3i4J5k6L7m8N9o0P1q2R3s4T5u6V7w8X9y0Z1a2B3c4D5e6F7g8H9i0J1k2L3m";

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
            url: `ws://localhost:8000/chat/${router.query.id}/`,
            heartTime: 5000, // 心跳时间间隔
            heartMsg: JSON.stringify({message: "heartbeat", token: localStorage.getItem("token"), heartbeat: true}),
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