import { useRouter } from "next/router";
import Link from 'next/link';
import { useRef, useState } from "react";
import Navbar from "./navbar";

interface Item {
    id: number;
    name: string;
    avatar: string;
}
  
const FriendBar = ({cookie} : {cookie:string|string[]|undefined}) => {
    const [list, setList] = useState<Item[]>([]);

    const router = useRouter();
    
    fetch(
        "api/user/get_friends",
        {
            method: "GET",
            credentials: 'include',
        }
    )
        .then((res) => res.json())
        .then((data) => {
            setList(data.friends)
        })
        .catch((err) => alert(err));
        
    return (
        <div style={{padding: 12}}>
            <Navbar/>
            <div>
                <ul className="friendlist">
                    <li className="newfriend" onClick={() => {router.push(`/user/searchfriend`)}}>
                        + 添加新好友
                    </li>
                    <li className="newfriend" onClick={() => {router.push(`/user/acceptfriend`)}}>
                        收到的好友邀请
                    </li>
                    {list?.map((item: Item) => (
                        <li className="friend">
                            <img className="friendavatar" src={`${item.avatar}`}></img>
                            {item.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FriendBar;