import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { nameValid, passwordValid } from "../utils/valid";
import swal from "@sweetalert/with-react";
import Swal from "sweetalert2";

const InitPage = () => {
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>(""); 
    const [nameLegal, setNameLegal] = useState<boolean>(false);
    const [passwordLegal, setPasswordLegal] = useState<boolean>(false);

    const router = useRouter();

    const userLoginbyMail = () => {
        fetch(
            "/api/user/login_with_email/",
            {
                method:"POST",
                credentials: "include",
                body:JSON.stringify({
                    email: name,
                    code_input: password,
                })
            }
        )
            .then((res) => {return res.json();})
            .then((res) => {
                if(res.code === 0){
                    console.log(res);
                    localStorage.setItem("token", res.Token);
                    router.push("/user");
                    console.log("成功登录");
                } else{
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => {
                Swal.fire({
                    title: "登陆失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                });
            });
    };

    const getPassword = () => {
        fetch(
            "/api/user/send_email_for_login/",
            {
                method:"POST",
                credentials: "include",
                body:JSON.stringify({
                    email: name,
                })
            }
        )
            .then((res) => {return res.json();})
            .then((res) => {
                if(res.code === 0){
                    console.log(res);
                    localStorage.setItem("token", res.Token);
                    router.push("/user");
                    console.log("成功登录");
                } else{
                    throw new Error(`${res.info}`);
                }
            })
            .catch((err) => {
                Swal.fire({
                    title: "登陆失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                });
            });
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
                    placeholder="邮箱"
                    value={name}
                    onChange={(e) => checkName(e.target.value)}
                />
                <button onClick={getPassword}>
                    发送验证码
                </button>
                <input
                    id="pwdinput"
                    type="password"
                    placeholder="验证码"
                    value={password}
                    onChange={(e) => {checkPassword(e.target.value);}}
                />
                <button onClick={userLoginbyMail} disabled={!password}>
                    登录
                </button>
                <button onClick={() => router.push("/")} >
                    使用密码登录
                </button>
                <button onClick={() => router.push("/register")}>
                    注册新用户
                </button>
            </div>
        </div>
    );
};

export default InitPage;