import { useRouter } from "next/router";
import Link from 'next/link';
import { useRef, useState } from "react";
import Navbar from "./navbar";

const InitPage = () => {
    
    const router = useRouter();

    return (
        <div>
            <Navbar/>
            <div id="title">
                这是消息界面
            </div>
        </div>
    );
};

export default InitPage;