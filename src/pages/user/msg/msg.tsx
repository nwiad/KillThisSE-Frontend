import { useRouter } from "next/router";
import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import MsgBar from "./msgbar";
import { websocket, createWebSocket, closeWebSocket, msg } from "../../../utils/websocket";
import MsgBox from "./msgbox";

const InitPage = () => {
    const [inputValue, setInput] = useState<string>("");
    const [message, setMsg] = useState<string>("");
    const [receivedMsg, setReceived] = useState<string>("");

    const sendPublic = () => {
        if(websocket.readyState === 1) {
            websocket.send(JSON.stringify({message: message}));
            console.log(message);
        }
    };

    websocket.onmessage = (event) => {
        setReceived(JSON.parse(event.data).message);
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