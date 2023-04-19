import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { websocket, createWebSocket, closeWebSocket } from "../../utils/websocket";

const Navbar = () => {
    const [msg, setMsg] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [avatar, setAvatar] = useState<string>();
    
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

    useEffect(() => {
        fetch(
            "/api/user/get_profile/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                setName(data.name);
                setAvatar(data.avatar);
    
            })
            .catch((err) => alert(err));
    })

    return (
        <nav style={{padding: 12}}>
            <ul className="navbar">
                <li className="navbar_ele_r" onClick={() => {router.push("/user/");}}>
                        消息
                </li>
                <li className="navbar_ele_r" onClick={() => {router.push("/user/friend/friendindex");}}>
                        好友
                </li>
                <li className="navbar_ele_info" onClick={() => {router.push("/user/info");}}>
                        <p>{name}</p>
                        <img className="navbarAvatar" src={`${avatar}`}/>
                </li>
                <li className="navbar_ele_l" onClick={() => {userLogout(); router.push("/");}}>
                        登出
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;