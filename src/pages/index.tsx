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
            <p>{message}</p>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={saveUser}>
                    Create an user
                </button>
                <button onClick={() => router.push("user_list")}>
                    View users
                </button>
            </div>
        </div>
    );
};

export default InitPage;