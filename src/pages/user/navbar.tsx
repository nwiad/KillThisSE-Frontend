import { useRouter } from "next/router";
import { useState } from "react";
import { websocket, createWebSocket, closeWebSocket } from "../../utils/websocket";

const Navbar = () => {
    const [msg, setMsg] = useState<string>("");
    
    const router = useRouter();

    const sendMsg = () => {
        if(websocket.readyState === 1) {
            websocket.send("{\"message\": \"FUCK\"}");
            console.log("ok");
        }
        // websocket.onopen = () => {
        //     websocket.send("{\"message\": \"FUCK\"}");
        //     console.log("ok");
        // }
    };

    const userLogout = () => {

        fetch(
            "/api/user/logout/",
            {
                method:"POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {
                if(res.ok){
                    router.push("/");
                }   else {
                    throw new Error(`Request failed with status ${res.status}`);
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <nav style={{padding: 12}}>
            <ul className="navbar">
                <li className="navbar_ele_r" onClick={() => {router.push("/user/");}}>
                        消息
                </li>
                <li className="navbar_ele_r" onClick={() => {router.push("/user/friendindex");}}>
                        好友
                </li>
                <input className="msg_box" type="text" value={msg} onChange={(e) => setMsg(e.target.value)} />
                <button onClick={() => sendMsg()}>send</button>
                <li className="navbar_ele_l" onClick={() => {router.push("/user/info");}}>
                        个人中心
                </li>
                <li className="navbar_ele_l" onClick={() => {userLogout(); router.push("/");}}>
                        登出
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;