import { time } from "console";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { CREATE_USER_SUCCESS, FAILURE_PREFIX,CREATE_USER_FAILURE_PERFIX } from "../constants/string";
import { request } from "../utils/network";

const InitPage = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>(""); 
    const [nameLegal, setNameLegal] = useState<boolean>(false);
    const [passwordLegal, setPasswordLegal] = useState<boolean>(false);

    const router = useRouter();

    const saveUser = () => {
        request(
            "api/user_register",
            "POST",
            {
                name: name,
                password: password,
            }
        )
            .then((res) => alert(CREATE_USER_SUCCESS))
            .catch((err) => alert(CREATE_USER_FAILURE_PERFIX + err));
    };

    const name_pattern = /^[a-zA-Z0-9_]{3,16}$/;
    const password_pattern = /^[a-zA-Z0-9_]{6,16}$/

    const checkName = (name_: string) => {
        setName(name_);
        if (name_.match(name_pattern) !== null){
            setNameLegal(true);
        }
        else {
            setNameLegal(false);
        }
    };

    const checkPassword = (password_: string) => {
        setPassword(password_);
        if (password_.match(password_pattern) !== null) {
            setPasswordLegal(true);
        }
        else {
            setPasswordLegal(false);
        }
    }

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
                    onChange={(e) => checkName(e.target.value)}
                />
                <span id="usernametip">*用户名必须由3-16位字母、数字和下划线组成</span>
                <input
                    id="pwdinput"
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => checkPassword(e.target.value)}
                />
                <span id="pwdtip">*密码必须由6-16位字母、数字和下划线组成</span>
                <button onClick={saveUser} disabled={!nameLegal || !passwordLegal}>
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