import { useRouter } from "next/router";
import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import MsgBar from "./msgbar";
import MsgBox from "./msgbox";
import { Options, Socket } from "../../../utils/websocket";

const InitPage = () => {
    const [inputValue, setInput] = useState<string>("");
    const [message, setMsg] = useState<string>("");
    const [receivedMsg, setReceived] = useState<string>("");

    const socket = useRef<Socket>();

    useEffect(() => {
        const options: Options = {
            url: "ws://localhost:8000/chat/",
            heartTime: 5000, // 心跳时间间隔
            heartMsg: "{\"message\": \"heartbeat\"}", // 心跳信息,默认为"ping"
            isReconnect: true, // 是否自动重连
            isDestroy: false, // 是否销毁
            reconnectTime: 5000, // 重连时间间隔
            reconnectCount: 5, // 重连次数 -1 则不限制
            openCb: () => {}, // 连接成功的回调
            closeCb: () => {}, // 关闭的回调
            messageCb: (event: MessageEvent) => {
                setReceived(JSON.parse(event.data).message);
            }, // 消息的回调
            errorCb: () => {} // 错误的回调
        };
        socket.current = new Socket(options);
        return (() => {
            socket.current?.destroy();
        });
    }, []);

    const sendPublic = () => {
        socket.current!.send(JSON.stringify({message: message}));
    };

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const handleClick = () => {
        setInput("");
    };

    return (
        <div>
            <MsgBar />
            <MsgBox msg={receivedMsg}/> 
            <div>
                <input 
                    className="msginput"
                    type="text"
                    placeholder="请输入内容"
                    value={inputValue}
                    onChange={(e) => {handleInput(e); setMsg(e.target.value);}}
                    style={{display : "inline-block", verticalAlign: "middle"}}
                />
                <button
                    className="msgbutton" onClick={() => {sendPublic(); handleClick();}} style={{display : "inline-block", verticalAlign: "middle"}}
                > 发送 </button>
            </div>
        </div>
    );
};

export default InitPage;