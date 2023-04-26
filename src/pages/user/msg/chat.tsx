import { ChangeEvent, useEffect, useState, useRef } from "react";
import Navbar from "../navbar";
import { useRouter } from "next/router";
import { Socket } from "../../../utils/websocket";
import { Options } from "../../../utils/type";

const ChatScreen = () => {
    const [inputValue, setInput] = useState<string>("");
    const [message, setMsg] = useState<string>("");
    const [msgList, setMsgList] = useState<string[]>([]);
    const router = useRouter();
    const query = router.query;

    const socket = useRef<Socket>();

    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const handleClick = () => {
        setInput("");
    };

    const sendPublic = () => {
        socket.current!.send(JSON.stringify({ message: message, token: localStorage.getItem("token") }));
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
            messageCb: (event: MessageEvent) => {
                //console.log(JSON.parse(event.data).messages);
                setMsgList(JSON.parse(event.data).messages.map((val: any) => (val.msg_body)));
            }, // 消息的回调
            errorCb: () => { } // 错误的回调
        };
        socket.current = new Socket(options);
        // todo: 获取消息列表
        return (() => {
            socket.current?.destroy();
        });
    }, [router, query]);

    // useEffect(() => {
    //     if(msgList?.length > 0) {
    //         console.log("msgLIst:", msgList);
    //     }
    // }, [msgList]);

    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <div>
                {msgList.map((msg) => (
                    <div key={1}>
                        {msg}
                    </div>
                ))}
            </div>
            <div>
                <input
                    className="msginput"
                    id="msginput"
                    type="text"
                    placeholder="请输入内容"
                    value={inputValue}
                    onChange={(e) => { handleInput(e); setMsg(e.target.value); }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            sendPublic(); 
                            handleClick();
                        }}}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                />
                <button
                    className="msgbutton" onClick={() => { sendPublic(); handleClick(); }} style={{ display: "inline-block", verticalAlign: "middle" }}
                > 发送 </button>
            </div>
        </div>
    );
};

export default ChatScreen;