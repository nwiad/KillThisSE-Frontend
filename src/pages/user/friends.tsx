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
        <div style={{padding: 12}}>
            <Navbar />
            <div id="title">
                这是好友列表
            </div>
        </div>
    );
};

export default InitPage;