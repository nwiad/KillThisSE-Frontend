import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../navbar";
import { all } from "axios";

interface Friend {
    user_id: number;
    name: string;
    avatar: string;
}

interface Group {
    group_id: number;
    group_name: string;
    admin_id: number;
    collapsed: boolean;
    friends: Friend[];
}
const FriendBar = () => {
    const [friendsList, setFriendsList] = useState([]);
    const [groupsList, setGroupsList] = useState<Group[]>([]);
    const [allCollapsed, setAllCollapsed] = useState(false);
    const [showPopupNewGroup, setShowPopupNewGroup] = useState(false);
    const [newGroup, setNewGroup] = useState<string>("");

    const router = useRouter();
    useEffect(() => {
        fetch(
            "/api/user/get_friends/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {return res.json();})
            .then((data) => {
                if (data.code === 0) {
                    const friends = data.friends.map((friend: Friend) => ({
                        user_id: friend.user_id,
                        name: friend.name,
                        avatar: friend.avatar
                    }));
                    setFriendsList(friends);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));

        fetch(
            "/api/user/get_group/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => {return res.json();})
            .then((data) => {
                if (data.code === 0) {
                    const groups = data.groups.map((group: Group) => ({
                        group_id: group.group_id,
                        group_name: group.group_name,
                        admin_id: group.admin_id
                    }));
                    setGroupsList(groups);
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
    }, []);

    const createNewGroup = async () => {
        await fetch(
            "/api/user/create_group/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    name: newGroup,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    alert("成功");
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
        router.push("/user/friend/friendindex");
    };

    const getGroupInfo = async (id:number) => {
        const foundGroup = groupsList.find(group => group.group_id === id);
        await fetch(
            "/api/user/get_group_friends/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    group_id: id,
                    token: localStorage.getItem("token")
                })
            }
        )
            .then((res) => { return res.json(); })
            .then((data) => {
                if (data.code === 0) {
                    if (data.code === 0) {
                        const friends = data.friends.map((friend: Friend) => ({
                            user_id: friend.user_id,
                            name: friend.name,
                            avatar: friend.avatar
                        }));
                        if(foundGroup) foundGroup.friends = friends;
                    }
                } else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));
        router.push("/user/friend/friendindex");
    };

    return (
        <div style={{ padding: 12 }}>
            <Navbar />
            <div>
                <ul className="friendlist">
                    <li className="newfriend"
                        onClick={() => { router.push("/user/friend/searchfriend"); }}
                        style={{ padding: 20 }}>
                        + 添加新好友
                    </li>
                    <li className="newfriend"
                        onClick={() => { router.push("/user/friend/friendrequest"); }}
                        style={{ padding: 20 }}>
                        收到的好友邀请
                    </li>
                    <li className="newfriend"
                        onClick={() => { setShowPopupNewGroup(true); }}
                        style={{ padding: 20 }}>
                        新建分组
                    </li>
                    {showPopupNewGroup && (
                        <div className="popup">
                            <input
                                type="text"
                                value={newGroup}
                                onChange={(e)=>{setNewGroup(e.target.value);}}
                                placeholder="请输入新的分组名"
                                id="usernameinput" />
                            <button onClick={() => { createNewGroup(); setShowPopupNewGroup(false);}} >保存</button>
                            <button onClick={() => { setShowPopupNewGroup(false); }}>取消</button>
                        </div>
                    )}
                    <li className="newfriend"
                        onClick={() => { setAllCollapsed(!allCollapsed); }}
                        style={{ padding: 20 }}>
                        全部好友
                    </li>
                    {friendsList?.map((item: Friend) => (
                        <li key={item.user_id} 
                            className="friendinList"
                            onClick={() => { router.push(`/user/friend/friendinfo?id=${item.user_id}`); }}
                            style={{display:`${allCollapsed ? "block" : "none"}`, width:"80%"}}>
                            <img className="friendavatar" src={`${item.avatar}`} alt={"https://github.com/LTNSXD/LTNSXD.github.io/blob/main/img/favicon.jpg?raw=true"}/>
                            <p>{item.name}</p>
                        </li>
                    ))}
                    {groupsList?.map((item: Group) => (
                        <div key={item.group_id}>
                            <li key={item.group_id} className="friend" onClick={() => { 
                                getGroupInfo(item.group_id);
                                const foundGroup = groupsList.find(group => group.group_id === item.group_id);
                                if(foundGroup) foundGroup.collapsed = ! item.collapsed;
                            }}>
                                <p>{item.group_name}</p>
                            </li>
                            {item?.friends?.map((friend: Friend) => (
                                <li key={friend.user_id} 
                                    className="friendinList"
                                    onClick={() => { router.push(`/user/friend/friendinfo?id=${friend.user_id}`); }}
                                    style={{display:`${item.collapsed ? "block" : "none"}`, width:"80%"}}>
                                    <img className="friendavatar" src={`${friend.avatar}`} alt={"https://github.com/LTNSXD/LTNSXD.github.io/blob/main/img/favicon.jpg?raw=true"}/>
                                    <p>{friend.name}</p>
                                </li>
                            ))}
                        </div>
                    ))}
                        
                </ul>
            </div>
        </div>
    );
};

export default FriendBar;