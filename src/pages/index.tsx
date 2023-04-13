import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { nameValid, passwordValid } from "../utils/valid";

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
            "/api/user/login/",
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
                    console.log("成功登录");
                } else{
                    document.cookie = "session=logout; path=/;";
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => {alert(err); document.cookie = "session=logout; path=/;";});
    };

    const checkName = (name_: string) => {
        setName(name_);
        setNameLegal(nameValid(name_));
    };

    const checkPassword = (password_: string) => {
        setPassword(password_);
        // alert(document.cookie);
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
                    onChange={(e) => {checkPassword(e.target.value); console.log(document.cookie);}}
                />
                <button onClick={userLogin} disabled={!nameLegal || !passwordLegal || document.cookie.match(/session=(\d+)/) !== null}>
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
                <button onClick={() => {document.cookie = "session=logout; path=/;";}}>
                    清除cookie
                </button>
            </div>
        </div>
    );
};

export default InitLoginPage;