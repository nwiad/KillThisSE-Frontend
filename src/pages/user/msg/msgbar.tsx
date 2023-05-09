import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../navbar";
import {ChatMetaData} from "../../../utils/type";

const MsgBar = () => {
    const [chatList, setChatList] = useState<ChatMetaData[]>([]);
    const [refreshing, setRefreshing] = useState<boolean>(true);

    const router = useRouter();
    const query = router.query;

    useEffect(() => {
        if(!router.isReady) {
            return;
        }
        fetchList();
    }, [router, query]);

    const fetchList = () => {
        setRefreshing(true);
        fetch(
            "/api/user/get_private_conversations/",
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
                console.log("获取消息列表成功");
                console.log(data);
                setChatList(data.conversations.map((val: any) => ({...val})));
                setRefreshing(false);
            })
            .catch((err) => {
                alert(err); 
                setRefreshing(false);
            });
    };

    return refreshing ? (
        <p> Loading... </p>
    ) : (
        <div style = {{ padding: 12 }}>
            <Navbar />
            {chatList.length === 0 ? (
                <ul className="friendlist"> 当前没有会话 </ul>
            ) : (
                <ul className="friendlist">
                    {chatList.map((chat) => (
                        <li key={chat.id} style={{display: "flex", flexDirection: "row"}} onClick={() => router.push(`/user/msg/chat?id=${chat.id}`)}>
                            <img src={`${chat.friend_avatar}`}/>
                            <p>{chat.friend_name}</p>
                            {/* <div>{chat.time}</div>
                            <div>{chat.unreadMsg}</div>
                            <div>{chat.lastMsg.slice(10)}</div> */}
                        </li>
                    ))}</ul>
            )}
        </div>
    );
};

export default MsgBar;