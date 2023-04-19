import { useRouter } from "next/router";
import Link from "next/link";
import { useRef, useState } from "react";
import MsgBar from "./msg/msgbar";

const InitPage = () => {
    
    const router = useRouter();

    return (
        <div>
            <MsgBar />
        </div>
    );
};

export default InitPage;