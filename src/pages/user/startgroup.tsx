import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { useRouter } from "next/router";
import { assert } from "console";

interface Friend {
    user_id: number;
    name: string;
    avatar: string;
    chosen: boolean;
}

const GroupStarter = () => {
    const [groupFriendList, setGroupFriendList] = useState<Friend[]>([]);
    const [groupName, setGroupName] = useState<string>("");
    const [groupMembers, setGroupMembers] = useState<number[]>([]);
    const router = useRouter();

    useEffect(() => {
        console.log("群聊成员:", groupMembers);
    }, [groupMembers, groupFriendList]);

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
                        avatar: friend.avatar,
                        chosen: false
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
        <div className="popup" style={{ display: "flex", flexDirection: "column", height: "500px" }}>
            <div className="startgrouptitle">发起群聊</div>
            <input onChange={(e) => setGroupName(e.target.value)} placeholder="群聊名称" />
            <div className="startgroupfriends">请选择需要邀请的好友</div>
            <ul className="startgroupchoice">
                {groupFriendList?.map((item: Friend) => (
                    <div className="startgroupchoicebox" key={item.user_id} style={{backgroundColor: `${item.chosen ? "#0660e9" : "white"}`}} onClick={() => { item.chosen = !item.chosen; addOrRemoveGroupMember(item.user_id); }}>
                        <img className="startgroupavatar" src={`${item.avatar}`} alt="oops" />
                        <p className="startgroupname">
                            {item.name} </p>
                    </div>
                ))}
            </ul>
            <div style={{ display: "flex", flexDirection: "row", margin:"auto"}}>
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