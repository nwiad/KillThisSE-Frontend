import { useRouter } from "next/router";
import Link from 'next/link';
import { useRef, useState } from "react";
import Navbar from "./navbar";

const InitPage = () => {
    
    const router = useRouter();
    const cookie = router.query.cookie;

    if (typeof cookie === 'string') {
      document.cookie = cookie;
    } else {
        console.log("Cookie not found");
    }

    return (
        <div>
            <Navbar cookie={cookie}/>
            <div id="title">
                这是消息界面
            </div>
        </div>
    );
};

export default InitPage;