import { useRouter } from "next/router";
import Link from "next/link";
import { useRef, useState } from "react";
import FriendBar from "./friendbar";

const InitPage = () => {
    
    const router = useRouter();
    
    return (
        <div>
            <FriendBar />
        </div>
    );
};

export default InitPage;