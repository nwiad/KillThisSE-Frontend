import { time } from "console";
import { useRouter } from "next/router";
import Link from "next/link";
import { useRef, useState } from "react";
import { CREATE_USER_SUCCESS, FAILURE_PREFIX,CREATE_USER_FAILURE_PERFIX } from "../constants/string";
import { request } from "../utils/network";
import { nameValid, passwordValid } from "../utils/valid";
import { randomInt } from "crypto";
import initPage from "../pages/user/index";

const InitLoginPage = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>(""); 
    const [nameLegal, setNameLegal] = useState<boolean>(false);
    const [passwordLegal, setPasswordLegal] = useState<boolean>(false);

    const router = useRouter();

    const userLogin = () => {
        const rand = Math.floor(Math.random() * 100000);
        document.cookie = `session=${rand}; path=/;`;
        fetch(
            "api/user/login/",
            {
                method:"POST",
                credentials: "include",
                body:JSON.stringify({
                    name: name,
                    password: password,
                })
            }
        )
            .then((res) => {return res.json();})
            .then((res) => {
                if(res.code === 0){
                    router.push("/user");
                } else{
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    const checkName = (name_: string) => {
        setName(name_);

        setNameLegal(nameValid(name_));
    };

    const checkPassword = (password_: string) => {
        setPassword(password_);

        setPasswordLegal(passwordValid(password_));
    };

    return (
        <div style={{padding: 12}}>
            <ul className="indexbar">
                <li>
                    <Link href="/">
                        KillthisSE IM
                    </Link>
                </li>
            </ul>
            <div id="main" style={{ display: "flex", flexDirection: "column", margin: "50px auto" }}>
                <img src="https://i.hd-r.cn/95c0358239b9d888355844c9dd54d67a.png"></img>
                <input
                    id="usernameinput"
                    type="text"
                    placeholder="用户名"
                    value={name}
                    onChange={(e) => checkName(e.target.value)}
                />
                <input
                    id="pwdinput"
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => checkPassword(e.target.value)}
                />
                <button onClick={userLogin} disabled={!nameLegal || !passwordLegal}>
                    登录
                </button>
                <button onClick={() => {
                    const rand = Math.floor(Math.random() * 100000);
                    router.push("/user");
                }}>
                    登录（测试用）
                </button>
                <button onClick={() => router.push("/register")}>
                    注册新用户
                </button>
            </div>
        </div>
    );
};

export default InitLoginPage;