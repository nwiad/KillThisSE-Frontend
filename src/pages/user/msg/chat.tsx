import Picker from "@emoji-mart/react";
import { faFaceSmile, faFile, faImage, faMicrophone, faPaperPlane, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useRouter } from "next/router";
import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState } from "react";
import { uploadFile } from "../../../utils/oss";
import { CovnMetaData, MemberMetaData, MsgMetaData, Options } from "../../../utils/type";
import { Socket, suffix } from "../../../utils/websocket";
import Navbar from "../navbar";
import DetailsPage from "./details";
import MsgBar from "./msgbar";

const ChatScreen = () => {
    const selectRef = useRef<HTMLSelectElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [cursorPosStart, setCursorPosStart] = useState<number | null>(null);
    const [cursorPosEnd, setCursorPosEnd] = useState<number | null>(null);

    const [inputValue, setInput] = useState<string>("");
    const [message, setMsg] = useState<string>("");
    const [msgList, setMsgList] = useState<MsgMetaData[]>([]);
    const [memberList, setmemberList] = useState<MemberMetaData[]>([]);
    const [convList, setconvList] = useState<CovnMetaData[]>([]);
    const [myID, setID] = useState<number>();
    const chatBoxRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const query = router.query;
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    // image
    const [newimg, setNewImg] = useState<File>();
    const [isImgUploaded, setIsImgUploaded] = useState(false);
    const [showPopupImg, setShowPopupImg] = useState(false);
    // video
    const [newvideo, setNewVideo] = useState<File>();
    const [isVideoUploaded, setIsVideoUploaded] = useState(false);
    const [showPopupVideo, setShowPopupVideo] = useState(false);
    // file
    const [newfile, setNewFile] = useState<File>();
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [showPopupFile, setShowPopupFile] = useState(false);
    // audio
    const [recording, setRecording] = useState(false);
    const [multiselecting, setMultiselecting] = useState(false);
    const [audioURL, setAudioURL] = useState("");

    // const [mediaRecorder,setmediaRecorder]= useRef<MediaRecorder>(new MediaRecorder(new MediaStream()));
    const mediaRecorder = useRef<MediaRecorder | undefined>();

    const socket = useRef<Socket>();

    const [chatID, setChatID] = useState<string>();
    const [chatName, setChatName] = useState<string>();
    const [isGroup, setIsGroup] = useState<string>();
    const [refreshing, setRefreshing] = useState<boolean>(true);
    const [showPopupMention, setShowPopupMention] = useState(false);
    const [popupMentionPosition, setPopupMentionPosition] = useState({ x: 0, y: 0 });

    const [sticked, setSticked] = useState<string>();
    const [silent, setSilent] = useState<string>();

    // 功能：切换emoji显示
    const toggleEmojiPicker = () => {
        setShowEmojiPicker(showEmojiPicker => !showEmojiPicker);
    };
    // 功能：处理emoji点击
    const handleEmojiClick = (emoji: { native: string; }) => {
        setMsg(inputValue + emoji.native);
        setInput(inputValue + emoji.native);
        setShowEmojiPicker(false);
    };
    // 实时更新输入框内容
    useEffect(() => {
        setMsg(inputValue);
    }, [inputValue]);
    const sendPublic = async (isImg?: boolean, isFile?: boolean, isVideo?: boolean) => {
        if (message === "") {
            return;
        }
        // 私聊直接发
        if (isGroup === "false") {
            socket.current!.send(JSON.stringify({
                message: inputValue, token: localStorage.getItem("token"),
                isImg: false, isFile: false, isVideo: false
            }));
        }
        else{
            // 群聊可能有@name
            // 表示该条消息提及了谁
            let mentioned_members = [];
            // message表示消息内容 从中提取是否有@name
            // 如果有，提取出来，然后发送消息
            const all = "全体成员";
            // 有@ 才检查是否有名字
            if(message.includes("@")) {
                console.log("有@");
                if (message.includes(`@${all}`)) {
                    // 如果包含全体成员，将所有用户名添加到提及成员的数组中
                    mentioned_members.push(memberList.map(member => member.user_name));
    
                }
                else //不是全体成员
                    for (let member of memberList){
                        // 检查消息中是否包含用户名
                        if (message.includes(`@${member.user_name}`)) {
                            // 如果包含，将用户名添加到提及成员的数组中
                            mentioned_members.push(member.user_name);
                        }
                    }
            }
            socket.current!.send(JSON.stringify({
                message: inputValue, token: localStorage.getItem("token"),
                isImg: false, isFile: false, isVideo: false,
                mentioned_members: mentioned_members
            }));
        }
    };

    const cleanUp = () => {
        console.log("回收");
        socket.current?.destroy();
    };

    // 功能：发送图片
    const sendPic = async (pic: File | undefined) => {
        if (pic === undefined) {
            alert("未检测到图片");
            return;
        }
        const image_url = await uploadFile(pic);

        socket.current!.send(JSON.stringify({
            message: image_url, token: localStorage.getItem("token"),
            is_image: true
        }));
    };

    // 功能：发送视频
    const sendVideo = async (pic: File | undefined) => {
        if (pic === undefined) {
            alert("未检测到视频文件");
            return;
        }
        const video_url = await uploadFile(pic);

        socket.current!.send(JSON.stringify({
            message: video_url, token: localStorage.getItem("token"),
            is_video: true
        }));
    };

    // 功能：发送文件
    const sendFile = async (pic: File | undefined) => {
        if (pic === undefined) {
            alert("未检测到文件");
            return;
        }
        const file_url = await uploadFile(pic);

        socket.current!.send(JSON.stringify({
            message: file_url, token: localStorage.getItem("token"),
            is_file: true
        }));
    };

    // 功能：创建链接
    function createLinkifiedMsgBody(msgBody: string) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return msgBody.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
    }

    // 开始/停止录音
    const handleRecording = async () => {
        // 如果正在录音
        if (recording) {
            const audioURL = await stopRecording();
            console.log("Recording stopped, audio URL:", audioURL);
            setRecording(false);
            sendAudio(audioURL);
        } else {
            startRecording();
            setRecording(true);
        }
    };

    // 开始录音
    const startRecording = async () => {
        if (typeof MediaRecorder === "undefined") {
            console.error("浏览器不支持 MediaRecorder API");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (!stream) {
                console.error("Failed to obtain audio stream");
                return;
            }
            mediaRecorder.current = new MediaRecorder(stream);
            console.log("Created MediaRecorder", mediaRecorder, "with options", mediaRecorder.current!.stream);
            mediaRecorder.current.start();
        } catch (err) {
            console.error("Failed to start recording: ", err);
        }
    };

    // 停止录音
    const stopRecording = async (): Promise<string> => {
        return new Promise(resolve => {
            if (typeof MediaRecorder === "undefined") {
                console.error("浏览器不支持 MediaRecorder API");
                return;
            }
            if (!mediaRecorder.current) {
                console.error("MediaRecorder is not initialized.");
                return;
            }
            mediaRecorder.current.stop();
            mediaRecorder.current.addEventListener("dataavailable", function onDataAvailable(e) {
                if (!mediaRecorder.current) {
                    console.error("MediaRecorder is not initialized.");
                    return;
                }
                mediaRecorder.current.removeEventListener("dataavailable", onDataAvailable); // 移除之前的事件监听器
                if (e.data && e.data.size > 0) {
                    const audioURL = URL.createObjectURL(e.data);
                    setAudioURL(audioURL);
                    resolve(audioURL);
                }
                else {
                    console.error("Failed to create audio URL from blob.");
                }
            });
            // 关闭音频流 释放麦克风资源
            const tracks = mediaRecorder.current.stream.getTracks();
            tracks.forEach(track => track.stop());
        });
    };

    // blob转file
    const blobToFile = (blob: Blob, name: string): File => {
        return new File([blob], name, { type: blob.type, lastModified: Date.now() });
    };

    // 发送语音
    const sendAudio = async (audioURL: string) => {
        try {
            const audioBlob = await (await fetch(audioURL)).blob();
            const audioFile = blobToFile(audioBlob, "recording.wav");
            const audioUrl = await uploadFile(audioFile);

            if (socket.current) {
                socket.current.send(JSON.stringify({
                    message: audioUrl,
                    token: localStorage.getItem("token"),
                    is_audio: true
                }));
            } else {
                console.error("Socket is not connected.");
            }
        } catch (err) {
            console.error("Failed to send audio: ", err);
        }
    };

    const handleMention = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const input = event.target as HTMLElement;
        const inputRect = input.getBoundingClientRect();
        const popupX = inputRect.left + window.scrollX;
        const popupY = inputRect.bottom + window.scrollY;
        setShowPopupMention(true);
        setPopupMentionPosition({ x: popupX, y: popupY });
    };

    function insertAtCursor(inputBase: HTMLElement | null, textToInsert: string) {
        const input = inputBase as HTMLInputElement;
        const currentValue = input?.value;
        if (cursorPosStart !== null && cursorPosEnd !== null) {
            setInput(currentValue.substring(0, cursorPosStart) + textToInsert + currentValue.substring(cursorPosEnd));
            // setMsg(currentValue.substring(0, cursorPosStart) + "@"+ textToInsert + currentValue.substring(cursorPosEnd));
        }

    }

    // 功能：消息右键菜单
    const msgContextMenu = (event: ReactMouseEvent<HTMLElement, MouseEvent>, user_id: number, msg_id: number, msg_body: string, msg_is_audio: boolean, msg_owner: number, msg_time: string) => {
        event.preventDefault();

        const contextMenu = document.createElement("ul");
        contextMenu.className = "msgContextMenu";
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;

        // user_id指当前登录的用户
        // msg_owner指消息的发送者
        if (!msg_is_audio) {
            if (user_id == msg_owner) {
                const deleteItem = document.createElement("li");
                deleteItem.className = "ContextMenuLi";
                deleteItem.innerHTML = "撤回";
                deleteItem.addEventListener("click", () => {
                    // 如果现在时间减去消息时间少于5分钟，可以撤回
                    event.stopPropagation();
                    const now_time_str = new Date();

                    console.log("当前时间");
                    console.log(now_time_str);
                    // Mon May 15 2023 18:34:08 GMT+0800

                    console.log(msg_time);
                    // 将输入的时间字符串转化为 moment 对象
                    let now_time_use = moment(now_time_str, "ddd MMM DD YYYY HH:mm:ss Z");
                    let msg_time_use = moment(msg_time, "MM-DD HH:mm");

                    // 因为 msg_time 没有年份，我们需要给它加上
                    msg_time_use.year(now_time_use.year());

                    // 计算时间差，单位为分钟
                    let time_diff = now_time_use.diff(msg_time_use, "minutes");
                    if (time_diff > 5) {
                        alert("该消息发送超过5分钟，不能撤回");
                        return;
                    }

                    socket.current!.send(JSON.stringify({
                        message: msg_body, token: localStorage.getItem("token"),
                        withdraw_msg_id: msg_id
                    }));
                    
                });
                contextMenu.appendChild(deleteItem);
            }
            const translateItem = document.createElement("li");
            translateItem.className = "ContextMenuLi";
            translateItem.innerHTML = "翻译";
            translateItem.addEventListener("click", async (event) => {
                event.stopPropagation();
                const target = document.getElementById(`msg${msg_id}`);
                console.log(target!.getElementsByTagName("p").length);
                console.log(target!.getElementsByClassName("translate")[0]);
                if (target!.getElementsByClassName("translate")[0]) {
                    console.log("已经有翻译结果了");
                    return;
                }
                const newElement = document.createElement("p");
                newElement.className = "translate";
                // newElement.innerHTML = await translate(msg_body);  翻译次数有限！！！
                newElement.innerHTML = "翻译结果";
                target?.insertAdjacentElement("beforeend", newElement);
                hideContextMenu();
                console.log(target!.getElementsByClassName("translate").length);

            });
            contextMenu.appendChild(translateItem);

        }
        else // 语音消息只能转文字
        {
            console.log("语音消息");
            console.log(msg_body);
            const transformItem = document.createElement("li");
            transformItem.className = "ContextMenuLi";
            transformItem.innerHTML = "语音转文字";

            transformItem.addEventListener("click", async (event) => {
                event.stopPropagation();
                const target = document.getElementById(`msg${msg_id}`);
                console.log(target!.getElementsByTagName("p").length);
                console.log(target!.getElementsByClassName("transform")[0]);

                if (target!.getElementsByClassName("transform")[0]) {
                    console.log("已经转换过了");
                    return;
                }
                const newElement = document.createElement("p");
                newElement.className="transform";
                // newElement.innerHTML = await transform(msg_body);
                // newElement.innerHTML = await transform(msg_body);  // 转换次数有限！！！
                newElement.innerHTML = "转文字结果";
                target?.insertAdjacentElement("beforeend", newElement);
                hideContextMenu();
                console.log("转换结果：" + newElement.innerHTML);
                console.log(target!.getElementsByClassName("transform").length);

            });
            contextMenu.appendChild(transformItem);
        }

        
        // 删除消息记录按钮
        const deleteItem = document.createElement("li");
        deleteItem.className = "ContextMenuLi";
        deleteItem.innerHTML = "删除";
        deleteItem.addEventListener("click", () => {
            event.stopPropagation();
            socket.current!.send(JSON.stringify({
                message: msg_body, token: localStorage.getItem("token"),
                deleted_msg_id: msg_id
            }));
        });
        contextMenu.appendChild(deleteItem);

        // 多选按钮--为了合并转发消息
        const multiselectItem = document.createElement("li");
        multiselectItem.className = "ContextMenuLi";
        multiselectItem.innerHTML = "多选";
        // 被选中的消息id list
        let selectedMessagesId: number[] = [];        
        multiselectItem.addEventListener("click", async (event) => {
            event.stopPropagation();
            // 弹出字幕 正在进行多选
            setMultiselecting(true);

            // 遍历消息的id 
            for (const msg of msgList) {
                msg_id = msg.msg_id;
                const target = document.getElementById(`msg${msg_id}`);
                // 如果消息已经被选中，就不再添加点击事件监听器
                if(target !== null)
                {
                    target.addEventListener("click", () => {
                    // 消息的 ID 是否已存在于 selectedMessages 数组中
                        if (!selectedMessagesId.includes(msg_id)) {
                            // 如果不存在，将 ID 添加到数组中并用chosen标记选中状态；
                            selectedMessagesId.push(msg_id);
                            msg.chosen = false;
                        } else {
                            // 已存在，从数组中移除 ID 并移除 chosen 类名以取消选中状态。
                            const index = selectedMessagesId.indexOf(msg_id);
                            if (index > -1) {
                                selectedMessagesId.splice(index, 1);
                                msg.chosen = true;
                            }
                        }});
                }
            }
            console.log(selectedMessagesId);

            // 给后端发的东西 后端收就可以 没有其他定义的位置
            // 合并转发消息

            // 点击转发按钮才会触发
            // 你可能需要一个发送按钮的引用，这是一个例子：
            const sendForwardButton = document.getElementById("send_forward_button");
            if(sendForwardButton !== null)
            {
                if(selectRef.current !== null)
                {
                    //点击按钮时候选择的会话id  表示即将发送到那个会话中
                    let selectedConversationId = selectRef.current.value;
                    console.log("选中的会话id");
                    console.log(selectedConversationId);
                    sendForwardButton.addEventListener("click", () => {
                        // 获取选中的对话ID
                        // 当用户点击发送按钮时，发送选中的消息id
                        socket.current!.send(JSON.stringify({
                            message: msg_body, token: localStorage.getItem("token"),
                            selectedMessages: selectedMessagesId,
                            targetConversationId: selectedConversationId // 转发到哪个会话
                        }));
        
                        // 清空选中的消息id列表并退出选择状态
                        selectedMessagesId = [];
                        setMultiselecting(false);
                    });
                }
            }
            // 后端收到消息后，将消息合并转发给所有人

            // todo 什么时候结束多选
        });
        contextMenu.appendChild(multiselectItem);


        document.body.appendChild(contextMenu);

        function hideContextMenu() {
            document.removeEventListener("mousedown", hideContextMenu);
            document.removeEventListener("click", hideContextMenu);
            document.body.removeChild(contextMenu);
        }

        // document.addEventListener("mousedown", hideContextMenu);
        document.addEventListener("click", hideContextMenu);
    };

    useEffect(() => {
        if (!router.isReady) {
            return;
        }
        setChatID(query.id as string);
        setChatName(query.name as string);
        setIsGroup(query.group as string);
        
        setSticked(query.sticked as string);
        setSilent(query.silent as string);

        const options: Options = {
            url: suffix + `${router.query.id}/${myID}/`,
            heartTime: 5000, // 心跳时间间隔
            heartMsg: JSON.stringify({ message: "heartbeat", token: localStorage.getItem("token"), heartbeat: true }),
            isReconnect: true, // 是否自动重连
            isDestroy: false, // 是否销毁
            reconnectTime: 5000, // 重连时间间隔
            reconnectCount: -1, // 重连次数 -1 则不限制
            openCb: () => { }, // 连接成功的回调
            closeCb: () => { }, // 关闭的回调
            messageCb: (event: MessageEvent) => {
                let currentUserid = myID;
                console.log("当前用户id: ", currentUserid);
                // message是后端发过来的消息们
                const messages = JSON.parse(event.data).messages;
                // 消息列表
                setMsgList(messages
                    // 如果这个人的id在删除列表里，就不显示消息
                    .filter((val: any) => !val.delete_members?.some((user: any) => user === currentUserid))
                    .map((val: any) => ({ ...val }))
                );
                
                const memberList = JSON.parse(event.data).members;
                setmemberList(memberList
                    .map((val: any) => ({ ...val }))
                );

                const convList = JSON.parse(event.data).conversations;
                setconvList(convList
                    .map((val: any) => ({ ...val }))
                );

                const last_id = messages.length === 0 ? -1 : messages.at(-1).msg_id;
                fetch(
                    "/api/user/set_read_message/",
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            conversation: router.query.id,
                            msg_id: last_id
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.code === 0) {
                            console.log("设置已读消息成功:", last_id);
                        }
                        else {
                            throw new Error(`${data.info}`);
                        }
                    })
                    .catch((err) => alert(err));
            }, // 消息的回调
            errorCb: () => { } // 错误的回调
        };
        socket.current = new Socket(options);
        return cleanUp;
    }, [router, query]);

    useEffect(() => {
        const msgs = document.getElementById("msgdisplay");
        msgs?.scroll(0, msgs?.scrollHeight - msgs?.clientHeight);
    }, [msgList]);

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
                setID(data.user_id);
            })
            .catch((err) => alert(err));
    }, []);

    useEffect(() => {
        if (showPopupMention) {
            const contextMenu = document.getElementsByClassName("msgContextMenu");
            document.addEventListener("click", hideMsgContextMenu);
        }

        function hideMsgContextMenu() {
            if (document.getElementById("msginput"))
                insertAtCursor(document.getElementById("msginput"), "@");
            setMsg(inputValue);
            setShowPopupMention(false);
            document.removeEventListener("click", hideMsgContextMenu);
        }
    }, [showPopupMention]);

    useEffect(() => {
        if (chatID !== undefined && chatName !== undefined && isGroup !== undefined && myID !== undefined && silent !== undefined) {
            console.log("聊天视窗刷新");
            setRefreshing(false);
        }
        else {
            setRefreshing(true);
        }
    }, [chatID, chatName, isGroup, myID, sticked, silent]);

    return refreshing ? (
        <div></div>
    ) : (
        <div style={{ padding: 12 }}>
            <Navbar />
            <MsgBar />
            <DetailsPage myID={myID!.toString()} chatID={chatID!} chatName={chatName!} group={isGroup!} sticked={sticked!} silent={silent!} />
            <div ref={chatBoxRef} id="msgdisplay" style={{ display: "flex", flexDirection: "column" }}>
                {msgList.map((msg) => (
                    <div key={msg.msg_id} className={msg.chosen?"msgchosen":"msg"}>
                        <div className={msg.sender_id !== myID ? "msgavatar" : "mymsgavatar"}>
                            <img className="sender_avatar" src={msg.sender_avatar} />
                        </div>
                        <div id={`msg${msg.msg_id}`} className={msg.sender_id !== myID ? "msgmain" : "mymsgmain"}
                            onContextMenu={(event) => {
                                msgContextMenu(event, myID!, msg.msg_id, msg.msg_body, msg.is_audio, msg.sender_id, msg.create_time);
                            }}>
                            <p className={msg.sender_id !== myID ? "sendername" : "mysendername"}>{msg.sender_name}</p>
                            {msg.is_image === true ? <img src={msg.msg_body} alt="🏞️" style={{ maxWidth: "100%", height: "auto" }} /> :
                                (msg.is_video === true ? <a id="videoLink" href={msg.msg_body} title="下载视频" >
                                    <img src="https://killthisse-avatar.oss-cn-beijing.aliyuncs.com/%E8%A7%86%E9%A2%91_%E7%BC%A9%E5%B0%8F.png" alt="📹"
                                        style={{ width: "100%", height: "auto" }} />
                                </a> :
                                    (msg.is_file === true ? <a id="fileLink" href={msg.msg_body} title="下载文件" >
                                        <img src="https://killthisse-avatar.oss-cn-beijing.aliyuncs.com/%E6%96%87%E4%BB%B6%E5%A4%B9-%E7%BC%A9%E5%B0%8F.png" alt="📁"
                                            style={{ width: "100%", height: "auto" }} />
                                    </a> :
                                        (msg.is_audio === true ? <a>
                                            {<audio src={msg.msg_body} controls />}
                                        </a> :
                                            <p className={msg.sender_id !== myID ? "msgbody" : "mymsgbody"}
                                                dangerouslySetInnerHTML={{ __html: createLinkifiedMsgBody(msg.msg_body) }}
                                            ></p>)))
                            }
                            <p className={msg.sender_id !== myID ? "sendtime" : "mysendtime"}>{msg.create_time}</p>
                        </div>
                    </div>
                ))}
            </div>
            {recording && (
                <div className="popuprecord">
                    <div className="popup-title">
                        &nbsp;&nbsp;正在录音......&nbsp;&nbsp;
                    </div>
                </div>
            )}
            {multiselecting && (
                <div className="popuprecord">
                    <div className="popup-title">
                        &nbsp;&nbsp;正在进行多选&nbsp;&nbsp;
                    </div>
                </div>
            )}
            <div className="conversation-select">
                <select id="conversation-select" ref={selectRef}>
                    {convList.map((conv) => (
                        <option key={conv.id} value={conv.id}>
                            {conv.name} {/* 或者你的对话对象的其他属性，例如 title */}
                        </option>
                    ))}
                </select>
            </div>
            <button id="send_forward_button"className="send_forward_button">
                发送选中的信息
            </button>
            <div className="inputdisplay">
                <input
                    className="msginput"
                    id="msginput"
                    type="text"
                    ref={inputRef}
                    placeholder="请输入内容"
                    value={inputValue}
                    onChange={(e) => {
                        if (inputRef.current !== null) {
                            setCursorPosStart(inputRef.current.selectionStart);
                            setCursorPosEnd(inputRef.current.selectionEnd);
                        }
                        setInput(e.target.value); setMsg(e.target.value);
                    }}
                    onKeyDown={async (event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            sendPublic();
                            setInput("");
                        };
                        if (event.key === "@") {
                            setShowPopupMention(true);
                            //验证是否为群聊
                            if(isGroup==="1")
                            {
                                if (inputRef.current !== null) {
                                    const startPos = inputRef.current.selectionStart;
                                    const endPos = inputRef.current.selectionEnd;
                                    Promise.resolve().then(async () => {
                                        await setCursorPosStart(startPos);
                                        await setCursorPosEnd(endPos);
                                        //insertAtCursor(inputRef.current, "@");
                                        setMsg(inputValue);
                                        handleMention(event);
                                    });
                                }
                            }
                        }
                        else {
                            setShowPopupMention(false);
                        }
                    }}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                />
                {showPopupMention &&  (
                    <div className="msgContextMenu">
                        {/* TODO:遍历群内好友 */}
                        {memberList.map((member) => (
                            <div key={member.user_id} className="msg">
                                <li className="ContextMenuLi" onClick={() => {
                                    if (document.getElementById("msginput"))
                                        insertAtCursor(document.getElementById("msginput"), member.user_name);
                                    setMsg(inputValue);
                                    setShowPopupMention(false);
                                }}>
                                    {member.user_name}
                                </li>
                                   
                            </div>
                        ))}
                        <div className="msg">
                            <li className="ContextMenuLi" onClick={() => {
                                if (document.getElementById("msginput"))
                                    insertAtCursor(document.getElementById("msginput"), "全体成员");
                                setMsg(inputValue);
                                setShowPopupMention(false);
                            }}>
                                <li>全体成员</li>
                            </li>
                        </div>
                        <div>
                            <li className="ContextMenuLi">
                                准备@的好友
                            </li>    
                        </div>
                    </div>

                )}
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <button className="sendbutton" onClick={() => { toggleEmojiPicker(); }}>
                        <FontAwesomeIcon className="Icon" icon={faFaceSmile} />
                    </button>
                    <button className="sendbutton" onClick={() => { setShowPopupImg(true); }}>
                        <FontAwesomeIcon className="Icon" icon={faImage} />
                    </button>
                    {showPopupImg && (
                        <div className="popup">
                            <form onSubmit={() => {
                                sendPic(newimg);
                                setIsImgUploaded(false);
                                setShowPopupImg(false);
                            }}>
                                <input placeholder="uploaded image"
                                    className="fileupload" type="file"
                                    name="avatar" accept="image/*"
                                    onChange={(event) => {
                                        setNewImg(event.target.files?.[0]);
                                        setIsImgUploaded(!!event.target.files?.[0]);
                                    }} />
                                <button type="submit"
                                    disabled={!isImgUploaded}>发送图片</button>
                            </form>
                            <button onClick={() => { setShowPopupImg(false); }}>取消</button>
                        </div>
                    )}
                    <button className="sendbutton" onClick={() => { setShowPopupVideo(true); }}>
                        <FontAwesomeIcon className="Icon" icon={faVideo} />
                    </button>
                    {showPopupVideo && (
                        <div className="popup">
                            <form onSubmit={() => {
                                sendVideo(newvideo);
                                setIsVideoUploaded(false);
                                setShowPopupVideo(false);
                            }}>
                                <input placeholder="uploaded video"
                                    className="fileupload" type="file"
                                    name="avatar" accept="video/*"
                                    onChange={(event) => {
                                        setNewVideo(event.target.files?.[0]);
                                        setIsVideoUploaded(!!event.target.files?.[0]);
                                    }} />
                                <button type="submit"
                                    disabled={!isVideoUploaded}>发送视频</button>
                            </form>
                            <button onClick={() => { setShowPopupVideo(false); }}>取消</button>
                        </div>
                    )}
                    <button className="sendbutton" onClick={() => { setShowPopupFile(true); }}>
                        <FontAwesomeIcon className="Icon" icon={faFile} />
                    </button>
                    {showPopupFile && (
                        <div className="popup">
                            <form onSubmit={() => {
                                sendFile(newfile);
                                setIsFileUploaded(false);
                                setShowPopupFile(false);
                            }}>
                                <input placeholder="uploaded file"
                                    className="fileupload" type="file"
                                    name="avatar" accept="*"
                                    onChange={(event) => {
                                        setNewFile(event.target.files?.[0]);
                                        setIsFileUploaded(!!event.target.files?.[0]);
                                    }} />
                                <button type="submit"
                                    disabled={!isFileUploaded}>发送文件</button>
                            </form>
                            <button onClick={() => { setShowPopupFile(false); }}>取消</button>
                        </div>
                    )}
                    {/* 发送语音功能 */}
                    <button className="sendbutton" onClick={() => { handleRecording(); }}>
                        <FontAwesomeIcon className="Icon" id={recording ? "notrcd" : "rcd"} icon={faMicrophone} />
                    </button>
                </div>
                <button
                    className="msgbutton"
                    onClick={() => { sendPublic(); setInput(""); }}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                > <FontAwesomeIcon className="Icon" icon={faPaperPlane} /> </button>
            </div>
            {showEmojiPicker && (
                <div className="emoji-picker-container" >
                    <Picker
                        onEmojiSelect={(emoji: { native: string }) => {
                            handleEmojiClick(emoji);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatScreen;