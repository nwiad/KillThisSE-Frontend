import { time } from "console";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { CREATE_USER_SUCCESS, FAILURE_PREFIX } from "../constants/string";
import { request } from "../utils/network";

const InitPage = () => {
    const [message, setMessage] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>(""); 

    const router = useRouter();

    request("api/startup", "GET")
        .then((res) => {
            setMessage(res.message);
        });

    const saveUser = () => {
        request(
            "api/user_register",
            "POST",
            {
                name: name,
                password: password,
                register_time: new Date().toLocaleTimeString(),
            }
        )
            .then((res) => alert(CREATE_USER_SUCCESS))
            .catch((err) => alert(FAILURE_PREFIX + err));
    };

    return (
        <div style={{padding: 12}}>
            <link href="../styles/login.css" rel="stylesheet"/>
            <p>{message}</p>
            <div style={{ display: "flex", flexDirection: "column", margin: "50px auto" }}>
                <img src="https://i.hd-r.cn/5608ae1a8a979f155292919ee818f4cc.jpg"></img>
                <p id="title"> KillthisSE IM </p>
                <input
                    type="text"
                    placeholder="用户名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={saveUser}>
                    注册新用户
                </button>
                <button onClick={() => router.push("user_list")}>
                    查看当前用户目录
                </button>
            </div>
        </div>
    );
};

export default InitPage;