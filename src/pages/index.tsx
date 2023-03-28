import { time } from "console";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { CREATE_USER_SUCCESS, FAILURE_PREFIX,CREATE_USER_FAILURE_PERFIX } from "../constants/string";
import { request } from "../utils/network";

const InitPage = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>(""); 

    const router = useRouter();

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
            .catch((err) => alert(CREATE_USER_FAILURE_PERFIX + err));
    };

    return (
        <div style={{padding: 12}}>
            <link href="../styles/login.css" rel="stylesheet"/>
            <div style={{ display: "flex", flexDirection: "column", margin: "50px auto" }}>
                <img src="https://i.hd-r.cn/95c0358239b9d888355844c9dd54d67a.png"></img>
                <input
                    id="usernameinput"
                    type="text"
                    placeholder="用户名"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <span id="usernametip">*用户名必须由3-16位字母、数字和下划线组成</span>
                <input
                    id="pwdinput"
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <span id="pwdtip">*密码必须由6-16位字母、数字和下划线组成</span>
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