import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faComment, faUsers, faUser, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import GroupStarter from "./startgroup";
import { GlobalContext } from "../../constants/GlobalContext";
import swal from "@sweetalert/with-react";
import Swal from "sweetalert2";


interface infoProps {
    name?: string,
    avatar?: string,
}

const Navbar = (props: infoProps) => {
    const [name, setName] = useState<string>("");
    const [avatar, setAvatar] = useState<string>();
    const [showPopupStartGroup, setShowPopupStartGroup] = useState(false);
    const { globalValue, updateGlobalValue } = useContext(GlobalContext);

    const router = useRouter();

    const userLogout = () => {

        fetch(
            "/api/user/logout/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {
                if (res.ok) {
                    router.push("/");
                } else {
                    throw new Error(`Request failed with status ${res.status}`);
                }
            })
            .catch((err) => 
                Swal.fire({
                    title: "登出失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
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
            .catch((err) => 
                Swal.fire({
                    title: "获取个人信息失败: " + err.message,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#39c5bb",
                    icon: "error",
                })
            );
    }, []);

    return (
        <div>
            <nav style={{ padding: 12, zIndex: 0, position: "fixed" }}>
                <ul className="navbar">
                    <li className="navbar_ele_r" onClick={() => { router.push("/user/"); }}>
                        <FontAwesomeIcon className="Icon" icon={faComment} />
                        消息
                    </li>
                    <li className="navbar_ele_r" onClick={() => { router.push("/user/friend/friendindex"); }}>
                        <FontAwesomeIcon className="Icon" icon={faUser} />
                        好友
                    </li>
                    <li className="navbar_ele_r" onClick={() => { setShowPopupStartGroup(true); }}>
                        <FontAwesomeIcon className="Icon" icon={faUsers} />
                        创建群聊
                    </li>
                    <li className="navbar_ele_info" onClick={() => { router.push("/user/info"); }}>
                        <p style={{
                            display: "inline-block", verticalAlign: "middle",
                            fontFamily: "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif"

                        }}>{props.name ? props.name : name}</p>
                        <img className="navbarAvatar" src={`${props.avatar ? props.avatar : avatar}`} style={{ display: "inline-block", verticalAlign: "middle" }} alt="oops" />
                    </li>
                    <li className="navbar_ele_l" onClick={() => { userLogout(); router.push("/"); }}>
                        <FontAwesomeIcon className="Icon" icon={faRightFromBracket} />
                        登出
                    </li>
                </ul>
            </nav>
            {
                showPopupStartGroup && (
                    <GroupStarter />
                )
            }
        </div >
    );
};

export default Navbar;