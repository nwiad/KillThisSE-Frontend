import { time } from "console";
import { useRouter } from "next/router";
import Link from 'next/link';
import { useRef, useState } from "react";
import { CREATE_USER_SUCCESS, FAILURE_PREFIX,CREATE_USER_FAILURE_PERFIX } from "../../constants/string";
import { request } from "../../utils/network";
import { nameValid, passwordValid } from "../../utils/valid";
import { randomInt } from "crypto";

const InitPage = () => {
    
    const router = useRouter();
    const cookie = router.query.cookie;

    if (typeof cookie === 'string') {
      document.cookie = cookie;
    } else {
      console.log('Cookie not found');
    }
        
    const userLogout = () => {
        fetch(
            "api/user/logout",
            {
                method:"DELETE",
                credentials: 'include',
            }
        )
            .then((res) => {
                if(res.ok){
                    router.push("/")
                } else{
                    throw new Error(`Request failed with status ${res.status}`);
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <div style={{padding: 12}}>
            <link href="../styles/login.css" rel="stylesheet"/>
            <ul>
                <li>
                    <Link href={`/user/?cookie=${document.cookie}`}>
                        消息
                    </Link>
                </li>
                <li>
                    <Link href={`/user/friends?cookie=${document.cookie}`}>
                        好友
                    </Link>
                </li>
                <li className="logout">
                    <Link href={`/user/info?cookie=${document.cookie}`}>
                        个人中心
                    </Link>
                </li>
                <li className="logout">
                    <Link href="/" onClick={userLogout}>
                        登出
                    </Link>
                </li>
            </ul>
            <div id="main" style={{ display: "flex", flexDirection: "column", margin: "50px auto" }}>
                这是好友列表
            </div>
        </div>
    );
};

export default InitPage;