import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { useRouter } from "next/router";
import { assert } from "console";

interface Friend {
    user_id: number;
    name: string;
    avatar: string;
}

const GroupStarter = () => {
    const [groupFriendList, setGroupFriendList] = useState<Friend[]>([]);
    const [groupName, setGroupName] = useState<string>("");
    const [groupMembers, setGroupMembers] = useState<number[]>([]);
    const router = useRouter();

    useEffect(() => {
        console.log("群聊成员:", groupMembers);
    }, [groupMembers]);

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

    useEffect(() => {
        getFriendList();
    }, []);

    const addOrRemoveGroupMember = (id: number) => {
        const index = groupMembers.indexOf(id);
        if (index !== -1) {
            let newArray = [...groupMembers];
            newArray.splice(index, 1);
            setGroupMembers(newArray);
        }
        else {
            setGroupMembers((memeberList) => [...memeberList, id]);
        }
    };

    const addGroupMember = (id: number) => {
        setGroupMembers((memeberList) => [...memeberList, id]);
    };

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
        <div style={{ padding: 12 }}>
            <Navbar />
            <div id="main" style={{ display: "flex", flexDirection: "column", margin: "100px auto" }}>
                <div className="startgrouptitle">发起群聊</div>
                <input onChange={(e) => setGroupName(e.target.value)} placeholder="群聊名称" />
                <div className="startgroupfriends">请选择需要邀请的好友</div>
                <ul className="startgroupchoice">
                    {groupFriendList?.map((item: Friend) => (
                        <div className="startgroupchoicebox" key={item.user_id} style={{ display: "flex", flexDirection: "row" }}>
                            <input
                                type="checkbox"
                                className="startgroupcheckbox"
                                onClick={() => { addOrRemoveGroupMember(item.user_id); }}
                            />
                            <li
                                className="navbar_ele_info"
                                style={{ display: "flex", width: "100%" }}>
                                <img className="sender_avatar" src={`${item.avatar}`} alt="oops" />
                                <p style={{ color: "black" }}>{item.name}</p>
                            </li>
                        </div>
                    ))}
                </ul>

                <button onClick={() => {
                    createGroupChat(); setGroupFriendList([]); setGroupMembers([]);
                    router.push("/user");
                }} disabled={groupMembers.length === 0 || groupName.length === 0}>完成</button>
                <button onClick={() => { setGroupFriendList([]); setGroupMembers([]); router.push("/user"); }}>取消</button>
            </div>
        </div>
    );
};

export default GroupStarter;