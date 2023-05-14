import { useRouter } from "next/router";
import Navbar from "../navbar";
import { useEffect, useState } from "react";

interface memberMetaData {
    id: number,
    name: string,
    avatar: string,
    is_admin: boolean,
    is_owner: boolean
}

const DetailsPage = () => {
    const router = useRouter();
    const query = router.query;
    const [chatID, setChatID] = useState<string>();
    const [chatName, setChatName] = useState<string>();
    const [isGroup, setIsGroup] = useState<string>();
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [myID, setID] = useState<string>();

    const [owner, setOwner] = useState<memberMetaData>();
    const [admins, setAdmins] = useState<memberMetaData[]>();
    const [members, setMemers] = useState<memberMetaData[]>();
    const [notice, setNotice] = useState<string>("");
    const [showPopUpNoticeBoard, setShowPopUpNoticeBoard] = useState<boolean>(false);
    const [newNotice, setNewNOtice] = useState<string>("");
    
    useEffect(() => {
        if(!router.isReady) {
            return;
        }
        setChatID(query.id as string);
        setChatName(query.name as string);
        setIsGroup(query.group as string);
        setID(query.myID as string);
    }, [router, query]);

    useEffect(() => {
        if(chatID !== undefined && chatName !== undefined && isGroup !== undefined && myID !== undefined) {
            if(isGroup === "1") {
                // 获取群成员
                fetch(
                    "/api/user/get_group_members/",
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            group: chatID
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if(data.code === 0) {
                            setMemers( data.members.map( (member: any) => ({...member}) ) );
                        }
                        else {
                            throw new Error(`${data.info}`);
                        }
                    })
                    .catch((err) => alert(err));
                // 获取管理员（不含群主）
                fetch(
                    "/api/user/get_group_administrators/",
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            group: chatID
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if(data.code === 0) {
                            setAdmins( data.administrators.map( (admin: any) => ({...admin}) ) );
                        }
                        else {
                            throw new Error(`${data.info}`);
                        }
                    })
                    .catch((err) => alert(err));
                // 获取群主
                fetch(
                    "/api/user/get_group_owner/",
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            group: chatID
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if(data.code === 0) {
                            setOwner(data.owner);
                        }
                        else {
                            console.log(localStorage.getItem("token"));
                            throw new Error(`${data.info}`);
                        }
                    })
                    .catch((err) => alert(err));
                // 获取群公告
                fetch(
                    "/api/user/get_group_announcement/",
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            group: chatID
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if(data.code === 0) {
                            setNotice(data.Announcement);
                        }
                        else {
                            throw new Error(`${data.info}`);
                        }
                    })
                    .catch((err) => alert(err));
            }
        }
    }, [chatID, chatName, isGroup, myID]);

    useEffect(() => {
        if(owner !== undefined && admins !== undefined && members !== undefined) {
            console.log("聊天详情刷新");
            setRefreshing(false);
        }
    }, [owner, admins, members]);

    const closeNoticeBoard = () => {
        setShowPopUpNoticeBoard(false); 
        setNewNOtice("");
    };

    const submitNotice = () => {
        console.log(owner);
        fetch(
            "/api/user/set_group_announcement/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    group: chatID,
                    announcement: newNotice
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if(data.code === 0) {
                    alert("设置群公告成功");
                }
                else {
                    throw new Error(`${data.info}`);
                }
            })
            .catch((err) => alert(err));   
    };

    return refreshing ? (
        <p>Loading...</p>
    ) : ( isGroup === "1" ?  (
        <div style={{ padding: 12 }}>
            <Navbar />
            <button onClick={() => { router.push(`/user/msg/chat?id=${chatID}&name=${chatName}&group=${isGroup}`); }}>返回</button>
            <p> 群公告: {notice} </p>
            {
                (myID === owner!.id.toString()) ? (
                    <button disabled={myID !== owner!.id.toString()} onClick={() => { setShowPopUpNoticeBoard(true); }}>
                        设置/修改群公告
                    </button>
                ) : (
                    <button disabled={true} onClick={() => { setShowPopUpNoticeBoard(true); }}>
                        仅群主和管理员可设置/修改群公告
                    </button>
                )
            }
            {showPopUpNoticeBoard && (
                <div className="popup">
                    <input
                        placeholder="输入群公告"
                        onChange={(e) => { setNewNOtice(e.target.value); }}
                    />
                    <button onClick={() => {closeNoticeBoard();}}>
                        取消
                    </button>
                    <button onClick={() => { submitNotice(); setNotice(newNotice); closeNoticeBoard(); }} disabled={newNotice.length === 0}>
                        完成
                    </button>
                </div>
            )}
        </div>
    ) : (
        <div style={{ padding: 12 }}>
            <Navbar />
            <button onClick={() => { router.push(`/user/msg/chat?id=${chatID}&name=${chatName}&group=${isGroup}`); }}>返回</button>
            
        </div>
    ));
};

export default DetailsPage;