import { useEffect, useState } from "react";
import Navbar from "../navbar";
import { useRouter } from "next/router";

interface msgProps {
    msg: string;
}

const MsgBox = (props: msgProps) => {
    console.log("props.msg:", props.msg);
    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <div>
                <textarea className="msgbox" value={props.msg} readOnly/>
            </div>
        </div>
    );
};

export default MsgBox;