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

    if (typeof cookie === 'string') {
        document.cookie = cookie;
    } else {
      alert("Cookie not found");
    }
    
    fetch(
        "api/user/get_friends",
        {
            method: "GET",
            credentials: 'include',
        }
    )
        .then((res) => res.json())
        .then((data) => {
            setList(data.list)
        })
        .catch((err) => alert(err));
        
    return (
        <div style={{padding: 12}}>
            <Navbar cookie={cookie}/>
            <div>
                <ul className="friendlist">
                    <li className="newfriend" onClick={() => {router.push(`/user/searchfriend?cookie=${document.cookie}`)}}>
                        + 添加新好友
                    </li>
                    {list.map((item: Item) => (
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