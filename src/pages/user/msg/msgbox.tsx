import { useEffect, useState } from "react";
import Navbar from "../navbar";
import { useRouter } from "next/router";

interface msgProps {
    msg: string;
}

const MsgBox = (props: msgProps) => {
    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <div>
                <text className="msgbox">
                    {props.msg}
                </text>
            </div>
        </div>
    );
};

export default MsgBox;