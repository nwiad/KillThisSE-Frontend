import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MsgBar from "./msgbar";
import { websocket, createWebSocket, closeWebSocket, msg } from "../../../utils/websocket";
import MsgBox from "./msgbox";

const InitPage = () => {
    
    const router = useRouter();

    const [message, setMsg] = useState<string>("");
    const [receivedMsg, setReceived] = useState<string>("");

    const sendPublic = () => {
        if(websocket.readyState === 1) {
            websocket.send(JSON.stringify({message: message}));
            console.log(message);
        }
    };

    websocket.onmessage = function (event) {
        setReceived(JSON.parse(event.data).message);
    };

    return (
        <div>
            <MsgBar />
            <input 
                className="msginput"
                type="text"
                placeholder="请输入内容"
                onChange={(e) => setMsg(e.target.value)}
            />
            <button
                className="msgbutton" onClick={() => sendPublic()}
            > 发送 </button>
            <MsgBox msg={receivedMsg}/>
        </div>
    );
};

export default InitPage;