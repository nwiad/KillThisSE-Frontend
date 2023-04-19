import { useRouter } from "next/router";
import Link from "next/link";
import { useRef, useState } from "react";
import MsgBar from "./msgbar";

const InitPage = () => {
    
    const router = useRouter();

    return (
        <div>
            <MsgBar />
            <input 
                className="msginput"
                type="text"
                placeholder="请输入内容"
            />
            <button
                className="msgbutton"
            > 发送 </button>
        </div>
    );
};

export default InitPage;