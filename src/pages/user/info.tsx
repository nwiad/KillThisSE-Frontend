import { useRouter } from "next/router";
import Link from 'next/link';
import { useRef, useState } from "react";
import { nameValid, passwordValid } from "../../utils/valid";
import Navbar from "./navbar";


const InitPage = () => {
    const [name, setName] = useState<string>("");
    const [avatar, setAvatar] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [newpassword, setNewPassword] = useState<string>("");
    const [nameLegal, setNameLegal] = useState<boolean>(false);
    const [passwordLegal, setPasswordLegal] = useState<boolean>(false);
    const [showPopupName, setShowPopupName] = useState(false);
    const [showPopupPwd, setShowPopupPwd] = useState(false);

    const router = useRouter();
    const cookie = router.query.cookie;

    if (typeof cookie === 'string') {
        document.cookie = cookie;
    } else {
        console.log('Cookie not found');
    }

    const deleteUser = () => {
        fetch(
            "api/user/cancel_account",
            {
                method: "DELETE",
                credentials: 'include',
            }
        )
            .then((res) => {
                if (res.ok) {
                    alert("注销成功")
                    router.push("/")
                } else {
                    throw new Error(`Request failed with status ${res.status}`);
                }
            })
            .catch((err) => alert(err));
    };

    const checkName = (name_: string) => {
        setName(name_);

        setNameLegal(nameValid(name_));
    };

    const checkNewPassword = (password_: string) => {
        setNewPassword(password_);

        setPasswordLegal(passwordValid(password_));
    };

    const resetName = () => { };

    const resetPassword = () => { };

    const resetAvatar = () => { };

    /*fetch(
        "api/user/get_profile",
        {
            method:"GET",
            credentials: 'include',
        }
    )
        .then((res) => res.json())
        .then((data) => {
            setName(data.name)
            setAvatar(data.avatar)
        })
        .catch((err) => alert(err));
*/
    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <div id="main" style={{ display: "flex", flexDirection: "column", margin: "100px auto" }}>
                <p id="infoTitle">
                    您可以在此修改您的个人信息
                </p>
                <div
                    id="reName"
                    style={{ display: "inline-block", margin: "auto" }}>
                    <button className="resetName" onClick={() => {setShowPopupName(true);}}>
                        修改用户名
                    </button>
                </div>
                {showPopupName && (
                    <div className="popup">
                    <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => {checkName(e.target.value)}} 
                    placeholder="请输入新的用户名"
                    id="usernameinput"/>
                    <span id={nameLegal? "usernamelegaltip":"usernameillegaltip"}>*用户名必须由3-16位字母、数字和下划线组成</span>
                    <button onClick={() => {setShowPopupName(false)}} disabled={!nameLegal}>保存</button>
                    <button onClick={() => {setShowPopupName(false);}}>取消</button>
                    </div>
                )}
                <div
                    id="rePwd"
                    style={{ display: "inline-block", margin: "auto" }}>
                    <button className="resetName" onClick={() => {setShowPopupPwd(true)}}>
                        修改密码
                    </button>
                </div>
                {showPopupPwd && (
                    <div className="popup">
                    <input type="password" value={password} onChange={(e) => {setPassword(e.target.value)}} placeholder="请输入原密码"/>
                    <input type="password" value={newpassword} onChange={(e) => {checkNewPassword(e.target.value)}} placeholder="请输入新的密码"id="pwdinput"/>
                    <span id={passwordLegal? "pwdlegaltip":"pwdillegaltip"}>*密码必须由6-16位字母、数字和下划线组成</span>
                    <button onClick={() => {setShowPopupPwd(false);}}>保存</button>
                    <button onClick={() => {setShowPopupPwd(false);}}>取消</button>
                    </div>
                )}
                <button className="delete" onClick={deleteUser}>
                    注销本用户
                </button>
            </div>
        </div>
    );
};

export default InitPage;