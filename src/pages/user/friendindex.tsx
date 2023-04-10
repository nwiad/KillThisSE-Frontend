import { useRouter } from "next/router";
import Link from 'next/link';
import { useRef, useState } from "react";
import FriendBar from "./friendbar";

const InitPage = () => {
    
    const router = useRouter();
    const cookie = router.query.cookie;

    if (typeof cookie === 'string') {
      document.cookie = cookie;
    } else {
        alert("Cookie not found");
    }

    return (
        <div>
            <FriendBar cookie={cookie}/>
        </div>
    );
};

export default InitPage;