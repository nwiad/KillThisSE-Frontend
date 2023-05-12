import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faUsers, faUser, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";


interface Friend {
    user_id: number;
    name: string;
    avatar: string;
}

const Navbar = () => {
    const [name, setName] = useState<string>("");
    const [avatar, setAvatar] = useState<string>();
    const [showPopUpFriendList, setShowPopUpFriendList] = useState<boolean>(false);
    const [groupFriendList, setGroupFriendList] = useState<Friend[]>([]);
    const [groupName, setGroupName] = useState<string>("");
    const [groupMembers, setGroupMembers] = useState<number[]>([]);

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
            .catch((err) => alert(err));
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
            .catch((err) => alert(err));
    });

    const getFriendList = async () => {
        await fetch(
            "/api/user/get_friends/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    const friends = data.friends.map((friend: Friend) => ({
                        user_id: friend.user_id,
                        name: friend.name,
                        avatar: friend.avatar
                    }));
                    setGroupFriendList(friends);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    const addGroupMember = (id: number) => {
        setGroupMembers((memeberList) => [...memeberList, id]);
    };

    useEffect(() => {
        console.log("群聊成员:", groupMembers);
    }, [groupMembers]);

    const createGroupChat = async () => {
        await fetch(
            "/api/user/create_group_conversation/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    name: groupName,
                    members: groupMembers
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    alert("成功创建群聊");
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <nav style={{ padding: 12 }}>
            <ul className="navbar">
                <li className="navbar_ele_r" onClick={() => { router.push("/user/"); }}>
                    <FontAwesomeIcon className="Icon" icon={faComment} />
                    消息
                </li>
                <li className="navbar_ele_r" onClick={() => { router.push("/user/friend/friendindex"); }}>
                    <FontAwesomeIcon className="Icon" icon={faUser} />
                    好友
                </li>
                <li className="navbar_ele_r" onClick={() => { setShowPopUpFriendList(true); getFriendList(); }}>
                    <FontAwesomeIcon className="Icon" icon={faUsers} />
                    创建群聊
                </li>
                {showPopUpFriendList && (
                    <div className="popup">
                        <div>发起群聊</div>
                        <input onChange={(e) => setGroupName(e.target.value)} />
                        {groupFriendList?.map((item: Friend) => (
                            <li key={item.user_id}
                                className="friendinList"
                                onClick={() => { addGroupMember(item.user_id); }}
                                style={{ display: "flex", width: "100%" }}>
                                <img className="sender_avatar" src={`${item.avatar}`} alt="oops" />
                                <p style={{ color: "black" }}>{item.name}</p>
                            </li>
                        ))}
                        <button onClick={() => {
                            createGroupChat(); setGroupFriendList([]); setGroupMembers([]);
                            setShowPopUpFriendList(false);
                        }} disabled={groupMembers.length === 0 || groupName.length === 0}>完成</button>
                        <button onClick={() => { setGroupFriendList([]); setGroupMembers([]); setShowPopUpFriendList(false); }}>取消</button>
                    </div>
                )}
                <li className="navbar_ele_info" onClick={() => { router.push("/user/info"); }}>
                    <p style={{ display: "inline-block", verticalAlign: "middle" }}>{name}</p>
                    <img className="navbarAvatar" src={`${avatar}`} style={{ display: "inline-block", verticalAlign: "middle" }} alt="oops" />
                </li>
                <li className="navbar_ele_l" onClick={() => { userLogout(); router.push("/"); }}>
                    <FontAwesomeIcon className="Icon" icon={faRightFromBracket} />
                    登出
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;