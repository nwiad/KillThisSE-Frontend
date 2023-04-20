import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../navbar";

const MsgBar = () => {
    const [friendsList, setFriendsList] = useState([]);

    const router = useRouter();
    useEffect(() => {
    },[]);

    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <div>
                <ul className="msglist">
                    <li style={{ padding: 20 }} onClick={() => router.push("/user/msg/msg")}>
                        公屏聊天
                    </li>
                    <li style={{ padding: 20 }}>
                        假装这是另一个聊天
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default MsgBar;