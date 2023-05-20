import Picker from "@emoji-mart/react";
import { faPhone, faVideoSlash, faFilm, faFaceSmile, faFile, faImage, faMicrophone, faPaperPlane, faVideo, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { useRouter } from "next/router";
import { MouseEvent as ReactMouseEvent, useEffect, useRef, useState, useContext } from "react";
import { uploadFile } from "../../../utils/oss";
import { CovnMetaData, MemberMetaData, MsgMetaData, Options } from "../../../utils/type";
import { Socket, suffix } from "../../../utils/websocket";
import { translate } from "../../../utils/youdao";
import Navbar from "../navbar";
import DetailsPage from "./details";
import MsgBar from "./msgbar";
import { GlobalContext, CurrentVocalCallContext } from "../../../constants/GlobalContext";


// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
// import TRTC from "trtc-js-sdk";

interface EventListenerInfo {
    id: number;
    listener: () => void;
}

interface detailMetaData {
    name: string,
    read: boolean,
    avatar: string
}

interface readMetaData {
    name: string,
    avatar: string
}

const ChatScreen = () => {
    const { globalValue, updateGlobalValue } = useContext(GlobalContext);
    const { currentVocalCall, updateCurrentVocalCall } = useContext(CurrentVocalCallContext);

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
    const [myName, setMyName] = useState<string>("");
    const chatBoxRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const query = router.query;
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMemberDetail, setShowMemberDetail] = useState(false);
    const [showReadMembers, setShowReadMembers] = useState(false);
    const [memberDetailList, setMemberdetailList] = useState<detailMetaData[]>([]);
    const [readMembers, setReadMembers] = useState<readMetaData[]>([]);

    const [nowuserowner, setnowuserowner] = useState<string>("ss");
    const [nowuseradmin, setnowuseradmin] = useState<string>("ss");
    const [msg_owneradmin, setmsg_owneradmin] = useState<string>("ss");
    const [msg_ownerowner, setmsg_ownerowner] = useState<string>("ss");

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
    const [multiselected, setMultiselected] = useState(false);
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
    const [validation, setValidation] = useState<string>();
    const [calling, setCalling] = useState(false);

    const selected = useRef<number[]>([]);// 用于存储即将被转发的消息id列表

    // 功能：获取+展示转发的消息
    const [displayForwardMsgs, setDisplayForwardMsgs] = useState<boolean>(false); //展示转发来的多条信息
    const [refreshingRecords, setRefreshingRecords] = useState<boolean>(true);
    const [ForwardMsgs, setForwardMsgs] = useState<MsgMetaData[]>();
    // 在添加事件监听器时，将事件处理程序函数保存在变量中

    // 声明 eventListeners 数组的类型为 EventListenerInfo[]
    const [eventListeners, seteventListeners] = useState<EventListenerInfo[]>([]);

    // 正在回复的某条消息
    const [ReplyingMsg, setReplyingMsg] = useState<MsgMetaData>();
    // 是否正在有消息被提及
    const [replying, setreplying] = useState<boolean>(false);

    // can 设置撤回消息的权限
    const [can, setcan] = useState<boolean>(false);
    const [msg_owner, setmsg_owner] = useState<number>();

    const [sig, setSig] = useState<string>();

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
        // 是否有回复 只有文字信息才可能有回复某消息
        // 私聊直接发
        if (isGroup === "0") {
            if (replying) {
                socket.current!.send(JSON.stringify({
                    message: inputValue, token: localStorage.getItem("token"),
                    isImg: false, isFile: false, isVideo: false, quote_with: ReplyingMsg?.msg_id
                }));
            }
            else {
                socket.current!.send(JSON.stringify({
                    message: inputValue, token: localStorage.getItem("token"),
                    isImg: false, isFile: false, isVideo: false
                }));
            }
        }
        // 群聊检查是否有@name
        else {
            // 群聊可能有@name 表示该条消息提及了谁
            let mentioned_members = [];
            // message表示消息内容 从中提取是否有@name
            // 如果有，提取出来，然后发送消息
            const all = "全体成员";
            // 有@ 才检查是否有名字
            if (message.includes("@")) {
                console.log("有@");
                if (message.includes(`@${all}`)) {
                    // 如果包含全体成员，将所有用户名添加到提及成员的数组中
                    mentioned_members = memberList.map(member => member.user_name);

                }
                else //不是全体成员
                    for (let member of memberList) {
                        // 检查消息中是否包含用户名
                        if (message.includes(`@${member.user_name}`)) {
                            // 如果包含，将用户名添加到提及成员的数组中
                            // 将消息中的"@name"创建链接
                            // todo: 创建链接
                            setInput(message.replace(`@${member.user_name}`,
                                `<a href="http://localhost:3000/user" onclick="alert("点击了${member.user_name}")">@${member.user_name}</a>`));

                            mentioned_members.push(member.user_name);
                        }
                    }
            }
            if (replying) {
                socket.current!.send(JSON.stringify({
                    message: inputValue, token: localStorage.getItem("token"),
                    isImg: false, isFile: false, isVideo: false,
                    mentioned_members: mentioned_members, quote_with: ReplyingMsg?.msg_id
                }));
            }
            else {
                console.log("mentioned_members:", mentioned_members);
                socket.current!.send(JSON.stringify({
                    message: inputValue, token: localStorage.getItem("token"),
                    isImg: false, isFile: false, isVideo: false,
                    mentioned_members: mentioned_members
                }));
            }

        }
        setReplyingMsg(undefined);
        setreplying(false);
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
                setMyName(data.name);
                setSig(data.sig);
            })
            .catch((err) => alert("获取个人信息: " + err));
    }, []);

    const getAvatar = (name: string) => {
        fetch(
            "/api/user/get_avatar/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    name: name
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                return (data.avatar);
            })
            .catch((err) => alert("获取头像: " + err));
    };
    // 功能：创建链接
    function createLinkifiedMsgBody(msgBody: string) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const all = "全体成员";
        // 有@ 才检查是否有名字
        if (msgBody.includes("@")) {
            if (msgBody.includes(`@${all}`)) {
                console.log(`消息有@${all}`);
                msgBody = msgBody.replace(`@${all}`, () => {
                    return `<a>@${all}</a>`;
                });
            }
            for (let member of memberList) {
                // 检查消息中是否包含用户名
                if (msgBody.includes(`@${member.user_name}`)) {
                    console.log(`消息有@${member.user_name}`);
                    msgBody = msgBody.replace(`@${member.user_name}`, () => {
                        return `<a data-function="myFunction" data-name="${member.user_name}">@${member.user_name}</a>`;
                    });
                    console.log(msgBody);
                }
            }
            if (msgBody.includes(`@${myName}`)) {
                msgBody = msgBody.replace(`@${myName}`, () => {
                    return `<a >@${myName}</a>`;
                });
            }
        }
        msgBody = msgBody.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
        return msgBody;
    }

    function createDetailList(msgBody: string, msgid: number) {
        const all = "全体成员";
        // 有@ 才检查是否有名字
        if (msgBody.includes("@")) {
            fetch(
                "/api/user/get_mentioned_members/",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({
                        token: localStorage.getItem("token"),
                        msg_id: msgid
                    })
                }
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.code === 0) {
                        console.log(",emtioned_members from backend", data.mentioned_members);
                        setMemberdetailList(data.mentioned_members.map((member: any) => ({ ...member })));
                    }
                    else {
                        throw new Error(`${data.info}`);
                    }
                })
                .catch((err) => alert("获取at成员: " + err));
            // if (msgBody.includes(`@${all}`)) {
            //     console.log(`消息有@${all}`);
            // }
            // for (let member of memberList) {
            //     // 检查消息中是否包含用户名
            //     if (msgBody.includes(`@${member.user_name}`)) {
            //         console.log(`消息有@${member.user_name}`);
            //         console.log(msgBody);
            //     }
            // }
            // if (msgBody.includes(`@${myName}`)) {
            //     memberDetailList.push({name: myName, read: true});
            // }
        }
        if (memberDetailList.length)
            setShowMemberDetail(true);
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
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,
                    sampleSize: 16,
                    channelCount: 1
                }
            });
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
            const audioFile = blobToFile(audioBlob, "recording.webm");
            const audioUrl = await uploadFile(audioFile);
            console.log("audioUrl", audioUrl);
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
        const startPos = input?.selectionStart;
        const endPos = input?.selectionEnd;
        if (startPos !== null && endPos !== null)
            setInput(currentValue.substring(0, startPos) + "@" + textToInsert + currentValue.substring(endPos));
    }

    const addOrRemoveSelected = (id: number, target: HTMLElement) => {
        console.log("selected", selected.current);
        const index = selected.current.indexOf(id);
        console.log("index", index);
        console.log("id", id);
        if (index !== -1) {
            const newArray = [...selected.current];
            newArray.splice(index, 1);
            console.log("index  newArray", newArray);
            selected.current = newArray;
            console.log("selected", selected.current);
            const bgtarget = document.getElementById(`msgbg${id}`);
            if (bgtarget) bgtarget.className = "msg";
            console.log("----nowselected+" + selected.current);

        }
        else {
            const newArray = [...selected.current, id];
            console.log("else  newArray", newArray);//newArray正常
            selected.current = newArray;
            console.log("selected", selected.current);
            const bgtarget = document.getElementById(`msgbg${id}`);
            if (bgtarget) bgtarget.className = "msgchosen";
            console.log("+++++nowselected+" + selected.current);
        }
    };

    const sendForward = () => {
        //点击按钮时候选择的会话id  表示即将发送到那个会话中
        let selectedConversationId = selectRef.current!.value;
        console.log("选中的会话id");
        console.log(selectedConversationId);
        if (selected.current.length === 0) {
            return;
        }
        // 给目标会话发送这个消息
        const forwardOptions: Options = {
            url: suffix + `${selectedConversationId}/${myID}/`,
            // url: suffix + `2/${myID}/`,
            heartTime: 5000, // 心跳时间间隔
            heartMsg: JSON.stringify({ message: "heartbeat", token: localStorage.getItem("token"), heartbeat: true }),
            forward: true,
            forwardMsg: selected.current, //! 转发的消息id列表 后端用这2个参数
            isReconnect: true, // 是否自动重连
            isDestroy: false, // 是否销毁
            reconnectTime: 5000, // 重连时间间隔
            reconnectCount: -1, // 重连次数 -1 则不限制
            openCb: () => { }, // 连接成功的回调
            closeCb: () => { }, // 关闭的回调
            messageCb: (event: MessageEvent) => { }, // 消息的回调
            errorCb: () => { } // 错误的回调
        };
        const forwardSocket = new Socket(forwardOptions);
        setTimeout(() => {
            forwardSocket.destroy();
            console.log("我死啦");
        }, 1000);
        // 清空选中的消息id列表并退出选择状态
        selected.current = [];
        setMultiselecting(false);
        setMultiselected(false);

        // 遍历消息的id 
        // 恢复初始状态+移除监听事件
        console.log("501eventListeners");
        console.log(eventListeners);
        for (let msg of msgList) {
            const id = msg.msg_id;
            // 在移除事件监听器时，使用相同的函数引用
            console.log("我要移除监听器啦！！！！！！！！");
            console.log(id);
            const target = document.getElementById(`msg${id}`);
            // 如果target存在事件监听器
            if (target !== null) {
                for (let eventListener of eventListeners) {
                    if (eventListener.id === id) {
                        console.log("移除事件监听器！！！！");
                        target.removeEventListener("click", eventListener.listener);
                    }
                }
            }
            console.log("518518518eventListeners");
            console.log(eventListeners);
            const bgtarget = document.getElementById(`msgbg${id}`);
            // 恢复样式
            if (bgtarget)
                bgtarget.className = "msg";
        }
    };


    useEffect(() => {
        console.log("Updated selected:", selected.current);//这里的selected变了
    }, [selected]);

    useEffect(() => {
        if (nowuserowner)
            setcan(true);
        else if (nowuseradmin && ((msg_owner === myID) || (!msg_ownerowner && !msg_owneradmin)))
            setcan(true);
        else
            setcan(false);
        console.log("can!!!" + can);

    }, [nowuserowner, nowuseradmin, msg_ownerowner, msg_owneradmin]);

    const voice2text = async (url: string): Promise<string> => {
        let result = "[转换失败]";
        await fetch(
            "/api/user/voice2text/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    url: url
                })
            }
        )
            .then((res) => res.json())
            .then((text_data) => {
                if(text_data.code === 0) {
                    console.log("转换成功：", text_data);
                    result = text_data.Result;
                }
            });    
        return result;
    };

    const [showDoing, setShowDoing] = useState<boolean>(false);

    // 功能：消息右键菜单
    const msgContextMenu = (event: ReactMouseEvent<HTMLElement, MouseEvent>, user_id: number, msg_id: number, msg_body: string, msg_is_audio: boolean, msg_owner: number, msg_time: string, msg_istransmit: boolean) => {
        event.preventDefault();

        const contextMenu = document.createElement("ul");
        contextMenu.className = "msgContextMenu";
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.top = `${event.clientY}px`;
        setmsg_owner(msg_owner);
        // user_id指当前登录的用户
        // msg_owner指消息的发送者
        // 如果当前登录的用户是消息的发送者，可以撤回
        const chatID_num = parseInt(chatID!);
        fetch(
            "/api/user/get_member_status/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    member: user_id,
                    group: chatID_num
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    console.log("获取该用户在本会话中的身份");
                    setnowuseradmin(data.is_admin);
                    setnowuserowner(data.is_owner);
                }
                else {
                    throw new Error(`获取该用户在本会话中的身份: ${data.info}`);
                }
            })
            .catch(((err) => alert("获取该用户在本会话中的身份: " + err)));

        fetch(
            "/api/user/get_member_status/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    member: msg_owner,
                    group: chatID_num
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    console.log("获取该用户在本会话中的身份");
                    setmsg_owneradmin(data.is_admin);
                    setmsg_ownerowner(data.is_owner);
                }
                else {
                    throw new Error(`获取该用户在本会话中的身份: ${data.info}`);
                }
            })
            .catch(((err) => alert("获取该用户在本会话中的身份: " + err)));


        const withdrawInFive = () => {
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
        };
        const withdrawAllTime = () => {
            event.stopPropagation();
            socket.current!.send(JSON.stringify({
                message: msg_body, token: localStorage.getItem("token"),
                withdraw_msg_id: msg_id
            }));
        };
        let withdrawItem = document.getElementById("deleteItem");

        if (!msg_is_audio) {
            // 撤回按钮
            if (!withdrawItem && !msg_istransmit) { // 确保只添加一次
                if (can && isGroup === "1") {
                    console.log("都听我的！！！！！！！");
                    // 在群内且自己身份特殊  管理员和群主无视时间
                    const withdrawItem = document.createElement("li");
                    withdrawItem.className = "ContextMenuLi";
                    withdrawItem.innerHTML = "撤回";
                    withdrawItem.addEventListener("click", withdrawAllTime);
                    contextMenu.appendChild(withdrawItem);

                }
                else if (user_id === msg_owner && ((isGroup === "0") || ((isGroup === "1") && !nowuseradmin && !nowuserowner))) {
                    // 自己撤回自己有时间限制  私聊 or 群聊且自己身份普通成员
                    console.log("有时间限制噢！！！！！！！！！！！！！！！！！！！！");
                    const withdrawItem = document.createElement("li");
                    withdrawItem.className = "ContextMenuLi";
                    withdrawItem.innerHTML = "撤回";
                    withdrawItem.addEventListener("click", withdrawInFive);
                    contextMenu.appendChild(withdrawItem);
                }
            }
            let translateItem = document.getElementById("translateItem");
            if (!translateItem) {
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
                    newElement.innerHTML = await translate(msg_body);  //翻译次数有限！！！
                    // newElement.innerHTML = "翻译结果";
                    target?.insertAdjacentElement("beforeend", newElement);
                    hideContextMenu();
                    console.log(target!.getElementsByClassName("translate").length);

                });
                contextMenu.appendChild(translateItem);
            }
        }
        else // 语音消息不能撤回 只能转文字
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
                newElement.className = "transform";
                // newElement.innerHTML = await transform(msg_body);
                // newElement.innerHTML = await transform(msg_body);  // 转换次数有限！！！
                // newElement.innerHTML = "转文字结果";
                setShowDoing(true);
                newElement.innerHTML = await voice2text(msg_body);
                setShowDoing(false);
                target?.insertAdjacentElement("beforeend", newElement);
                hideContextMenu();
                console.log("转换结果：" + newElement.innerHTML);
                console.log(target!.getElementsByClassName("transform").length);

            });
            contextMenu.appendChild(transformItem);
        }

        let replyItem = document.getElementById("replyItem");
        let deleteItem = document.getElementById("deleteItem");

        if (!deleteItem) {
            // 删除消息记录按钮
            const deleteItem = document.createElement("li");
            deleteItem.className = "ContextMenuLi";
            deleteItem.innerHTML = "删除";
            const deleteEventListener = () => {
                event.stopPropagation();
                socket.current!.send(JSON.stringify({
                    message: msg_body, token: localStorage.getItem("token"),
                    deleted_msg_id: msg_id
                }));
            };
            deleteItem.addEventListener("click", deleteEventListener);
            contextMenu.appendChild(deleteItem);
        }
        if (!replyItem) {
            // 回复按钮
            const replyItem = document.createElement("li");
            replyItem.className = "ContextMenuLi";
            replyItem.innerHTML = "回复";
            const replyEventListeners = () => {
                //  从消息id找到消息
                setReplyingMsg(msgList.find((msg) => msg.msg_id === msg_id));
                setreplying(true);
                // 当点击发送按钮的时候 如果正在有消息被提及，则连带这个消息的id一起发送给后端
                // 显示正在回复的消息的信息
                event.stopPropagation();
            };
            replyItem.addEventListener("click", replyEventListeners);
            contextMenu.appendChild(replyItem);
        }

        if (isGroup === "1") {
            // 展示已读本消息成员的列表按钮
            const readItem = document.createElement("li");
            readItem.className = "ContextMenuLi";
            readItem.innerHTML = "已读成员列表";
            const readEventListeners = () => {
                event.stopPropagation();
                // 展示已读本消息成员的列表
                fetch(
                    "/api/user/get_read_members/",
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            msg_id: msg_id
                        })
                    }
                )
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.code === 0) {
                            console.log("获取已读成员列表成功");
                            setReadMembers(data.read_members.map((member: any) => ({ ...member })));

                            setShowReadMembers(true);
                        }
                        else {
                            throw new Error(`获取已读成员列表失败: ${data.info}`);
                        }
                    })
                    .catch(((err) => alert("获取已读成员列表: " + err)));
            };
            readItem.addEventListener("click", readEventListeners);
            contextMenu.appendChild(readItem);
        }

        // 多选按钮--为了合并转发消息
        const multiselectItem = document.createElement("li");
        multiselectItem.className = "ContextMenuLi";
        multiselectItem.innerHTML = "多选";
        multiselectItem.addEventListener("click", async (event) => {
            event.stopPropagation();
            hideContextMenu();
            setMultiselecting(true);
            const msgdp = document.getElementById("msgdisplay");
            if (msgdp) msgdp.className = "msgselecting";
            // 遍历消息的id 添加事件监听器 
            for (let msg of msgList) {
                const id = msg.msg_id;
                const target = document.getElementById(`msg${id}`);
                if (target !== null) {
                    console.log("添加事件监听器" + { id });
                    target.addEventListener("click", () => addOrRemoveSelected(id, target));
                    seteventListeners((listeners) => [...listeners, { id, listener: () => addOrRemoveSelected(id, target) }]);
                    console.log(eventListeners);
                }
            }
            console.log("764          eventListeners");
            console.log(eventListeners);
        });

        contextMenu.appendChild(multiselectItem);

        document.body.appendChild(contextMenu);

        function hideContextMenu() {
            //todo 移除所有事件监听器
            // deleteItem.removeEventListener("click", deleteEventListener);
            // replyItem.removeEventListener("click", replyEventListeners);

            document.removeEventListener("mousedown", hideContextMenu);
            document.removeEventListener("click", hideContextMenu);
            document.body.removeChild(contextMenu);
        }

        // document.addEventListener("mousedown", hideContextMenu);
        document.addEventListener("click", hideContextMenu);
    };

    const openFilter = (idlist: string) => {
        setDisplayForwardMsgs(true);
        setRefreshingRecords(true);

        const msgidList: number[] = JSON.parse(idlist);
        fetch(
            "/api/user/query_forward_records/",
            {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    token: localStorage.getItem("token"),
                    msgidlist: msgidList
                })
            }
        )
            .then((res) => res.json())
            .then((data) => {
                if (data.code === 0) {
                    console.log("获取转发的聊天记录成功");
                    // message是后端发过来的消息们
                    // 消息列表
                    console.log(data.messages);
                    setForwardMsgs(data.messages
                        .map((val: any) => ({ ...val }))
                    );
                }
                else {
                    throw new Error(`获取转发的聊天记录失败: ${data.info}`);
                }
            })
            .catch(((err) => alert("获取转发的聊天记录: " + err)));
    };

    // 计算转发消息的数量
    const countCommas = (str: string): number => {
        const pattern = /,/g;
        const matches = str.match(pattern);
        const count = matches ? matches.length : 0;
        return count + 1;
    };

    useEffect(() => {
        if (ForwardMsgs !== undefined) {
            console.log("ForwardMsgs: ", ForwardMsgs);
            setRefreshingRecords(false);
        }
    }, [ForwardMsgs]);

    const closeFilter = () => {
        setDisplayForwardMsgs(false);
        setRefreshingRecords(true);
    };


    const findRepliedMessageContent = (quoteId: number) => {
        const repliedMessage = msgList.find((msg) => msg.msg_id === quoteId);
        return repliedMessage ? repliedMessage.msg_body : "";
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
        setValidation(query.validation as string);

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
                // 是这里没有调用还是后端发过来的东西没变？
                const convList = JSON.parse(event.data).conversations;
                setconvList(convList
                    .map((val: any) => ({ ...val }))
                );
                console.log("convList" + convList);

                const last_id = messages.length === 0 ? -1 : messages.at(-1).msg_id;
                if (JSON.parse(event.data).refresh) {
                    socket.current!.send(JSON.stringify({
                        message: "wjlsb", token: localStorage.getItem("token"),
                        read: true
                    }));
                }

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
                    .catch((err) => alert("设置已读消息: " + err));
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
            .catch((err) => alert("获取个人信息: " + err));
    }, []);

    useEffect(() => {
        function hideMsgContextMenu() {
            if (document.getElementById("msginput"))
                insertAtCursor(document.getElementById("msginput"), "@");
            setMsg(inputValue);
            setShowPopupMention(false);
        }
    }, [showPopupMention]);

    useEffect(() => {
        if (chatID !== undefined && chatName !== undefined && isGroup !== undefined && myID !== undefined && sticked !== undefined && silent !== undefined && validation !== undefined && sig !== undefined) {
            console.log("聊天视窗刷新");
            setRefreshing(false);
        }
        else {
            setRefreshing(true);
        }
    }, [chatID, chatName, isGroup, myID, sticked, silent, validation, sig]);

    const sdkAppId = 1400811921;
    const client = useRef<any>();
    const localStream = useRef<any>();
    // let client, localStream;
    // const [client, setClient] = useState();

    const TRTC = useRef<any>();
    useEffect(() => {
        TRTC.current = require("trtc-js-sdk");
    }, []);

    const handleStartCall = async () => {
        const roomId = parseInt(chatID);
        const userId = myID.toString();
        const userSig = sig;
        client.current = TRTC.current.createClient({ mode: "rtc", sdkAppId, userId, userSig });
        // setClient(TRTC.current.createClient({ mode: "rtc", sdkAppId, userId, userSig }));
        setCalling(true);
        // 1.监听事件
        client.current.on("stream-added", event => {
            const remoteStream = event.stream;
            console.log("远端流增加: " + remoteStream.getId());
            //订阅远端流
            client.current.subscribe(remoteStream);
        });
        client.current.on("stream-subscribed", event => {
            // 远端流订阅成功
            const remoteStream = event.stream;
            console.log("订阅成功");
            // 播放远端流，传入的元素 ID 必须是页面里存在的 div 元素
            remoteStream.play("remoteStreamContainer");
        });
        // 2.进房成功后开始推流
        try {
            await client.current.join({ roomId });
            localStream.current = TRTC.current.createStream({ userId, audio: true, video: true });
            await localStream.current.initialize();
            // 播放本地流
            localStream.current.play("localStreamContainer");
            await client.current.publish(localStream.current);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFinishCall = async () => {
        localStream.current.close();
        // 停止本地流预览
        await client.current.leave();
        setCalling(false);
        // 退房成功，如果没有调用 client.destroy()，可再次调用 client.join 重新进房开启新的通话
        // 调用 destroy() 结束当前 client 的生命周期
        client.current.destroy();
    };

    const handleStartVocalCall = async () => {
        const roomId = parseInt(chatID);
        const userId = myID.toString();
        const userSig = sig;
        client.current = TRTC.current.createClient({ mode: "rtc", sdkAppId, userId, userSig });
        // setClient(TRTC.current.createClient({ mode: "rtc", sdkAppId, userId, userSig }));
        updateGlobalValue(true);
        updateCurrentVocalCall(chatID);
        // 1.监听事件
        client.current.on("stream-added", event => {
            const remoteStream = event.stream;
            console.log("远端流增加: " + remoteStream.getId());
            //订阅远端流
            client.current.subscribe(remoteStream);
        });
        client.current.on("stream-subscribed", event => {
            // 远端流订阅成功
            const remoteStream = event.stream;
            console.log("订阅成功");
            // 播放远端流，传入的元素 ID 必须是页面里存在的 div 元素
            remoteStream.play("remoteVocalStreamContainer");
        });
        // 2.进房成功后开始推流
        try {
            await client.current.join({ roomId });
            localStream.current = TRTC.current.createStream({ userId, audio: true, video: false });
            await localStream.current.initialize();
            // 播放本地流
            localStream.current.play("localVocalStreamContainer");
            await client.current.publish(localStream.current);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFinishVocalCall = async () => {
        updateCurrentVocalCall(-1);
        localStream.current.close();
        // 停止本地流预览
        await client.current.leave();
        updateGlobalValue(false);
        // 退房成功，如果没有调用 client.destroy()，可再次调用 client.join 重新进房开启新的通话
        // 调用 destroy() 结束当前 client 的生命周期
        client.current.destroy();
    };
    return refreshing ? (
        <div style={{ padding: 12 }}>
            正在加载会话窗口......
        </div>
    ) : ((
        <div style={{ padding: 12 }}>
            {calling && (
                <div className="overlay"></div>
            )}
            {calling && (
                <button className="hangup" onClick={handleFinishCall}>
                    <FontAwesomeIcon className="hangupicon" icon={faVideoSlash} />
                </button>
            )}
            <Navbar />
            <MsgBar currentChatID={parseInt(query.id as string)} />
            <DetailsPage myID={myID!.toString()} chatID={chatID!} chatName={chatName!} group={isGroup!} sticked={sticked!} silent={silent!} validation={validation!} />
            {calling && (
                <div className="callinginfo">
                    <FontAwesomeIcon className="callingicon" icon={faVideo} />
                    通话中
                </div>
            )}
            {calling && (
                <div id="localStreamContainer"></div>
            )}
            {calling && (
                <div id="remoteStreamContainer"></div>
            )}

            {globalValue && (
                <div id="localVocalStreamContainer"></div>
            )}
            {globalValue && (
                <div id="remoteVocalStreamContainer"></div>
            )}
            <div ref={chatBoxRef} id="msgdisplay" className="msgdpbox" style={{ display: "flex", flexDirection: "column" }}>

                {msgList.map((msg) => (
                    <div key={msg.msg_id} id={`msgbg${msg.msg_id}`} className={"msg"}>
                        <div className={msg.sender_id !== myID ? "msgavatar" : "mymsgavatar"}>
                            <img className="sender_avatar" src={msg.sender_avatar} />
                        </div>

                        <div id={`msg${msg.msg_id}`} className={msg.sender_id !== myID ? "msgmain" : "mymsgmain"}

                            onContextMenu={(event) => {
                                msgContextMenu(event, myID!, msg.msg_id, msg.msg_body, msg.is_audio, msg.sender_id, msg.create_time, msg.is_transmit);
                            }}>

                            <p className={msg.sender_id !== myID ? "sendername" : "mysendername"}>{msg.sender_name}</p>
                            {msg.quote_with !== -1 && (
                                <div className="translate" style={{ fontSize: "12px", height: "40px", maxWidth: "300px", overflowY: "auto" }}>
                                    回复：{findRepliedMessageContent(msg.quote_with)}
                                </div>
                            )}
                            {msg.is_transmit === true ? (
                                multiselecting === false ? (
                                    // 不在多选状态才能设置点击事件
                                    // 多选状态下点击该消息应该选中它
                                    <p
                                        className={msg.sender_id !== myID ? "msgbody" : "mymsgbody"}
                                        onClick={() => {
                                            openFilter(msg.msg_body);
                                            setDisplayForwardMsgs(true);
                                        }}
                                        style={{ color: "#0baaf9" }}
                                    >
                                        点击查看合并转发的消息 共{countCommas(msg.msg_body)}条
                                    </p>
                                ) : (
                                    <p className={msg.sender_id !== myID ? "msgbody" : "mymsgbody"} style={{ color: "#0baaf9" }}>
                                        点击查看合并转发的消息 共{countCommas(msg.msg_body)}条
                                    </p>
                                )) :
                                (msg.is_image === true ? <img src={msg.msg_body} alt="🏞️" style={{ maxWidth: "100%", height: "auto" }} /> :
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
                                                    onClick={() => { createDetailList(msg.msg_body, msg.msg_id); }}
                                                    dangerouslySetInnerHTML={{ __html: createLinkifiedMsgBody(msg.msg_body) }}
                                                ></p>)))
                                )}
                            {(isGroup === "0" && msg.sender_id === myID) && (
                                <p className={msg.sender_id !== myID ? "sendtime" : "mysendtime"}>
                                    {msg.is_read === true ? "已读" : "未读"}
                                </p>
                            )}
                            <p className={msg.sender_id !== myID ? "sendtime" : "mysendtime"}>{msg.create_time}</p>
                        </div>
                    </div>
                ))}
                {recording && (
                    <div className="popuprecord">
                        <div className="popup-title">
                            &nbsp;&nbsp;正在录音......&nbsp;&nbsp;
                        </div>
                    </div>
                )}
                {showDoing && (
                    <div className="popuprecord">
                        <div className="popup-title">
                            &nbsp;&nbsp;正在转换......&nbsp;&nbsp;
                        </div>
                    </div>
                )}
                {replying && (
                    <div className="popuprecord">
                        <div className="popup-title">
                            &nbsp;&nbsp;正在回复：&nbsp;{ReplyingMsg?.is_transmit ? "合并转发消息" : ReplyingMsg?.msg_body}&nbsp;&nbsp;
                        </div>
                    </div>
                )}

            </div>
            {showMemberDetail && (
                <div className="popup" style={{ padding: "20px", height: "auto", width: "auto" }}>
                    <FontAwesomeIcon className="closepopup" icon={faXmark} onClick={() => { setShowMemberDetail(false); setMemberdetailList([]); }} />
                    <p>在此消息中被@的成员</p>
                    {memberDetailList.map((item) => (
                        <div key={item.name} className="member">
                            <img className="sender_avatar" src={`${item.avatar}`} />
                            <p style={{ color: "black", margin: "auto 10px", fontSize: "25px" }}>{item.name}</p>
                            <div className={item.read ? "owner" : "admin"}>{item.read ? "已读" : "未读"}</div>
                        </div>
                    )
                    )}
                </div>
            )}
            {showReadMembers && (
                <div className="popup" style={{ padding: "20px", height: "auto", width: "auto" }}>
                    <FontAwesomeIcon className="closepopup" icon={faXmark} onClick={() => { setShowReadMembers(false); setReadMembers([]); }} />
                    <p>已读此消息的成员</p>
                    {readMembers.map((item) => (
                        <div key={item.name} className="member">
                            <img className="sender_avatar" src={`${item.avatar}`} />
                            <p style={{ color: "black", margin: "auto 10px", fontSize: "25px" }}>{item.name}</p>
                        </div>
                    )
                    )}
                </div>
            )}
            {displayForwardMsgs && (
                refreshingRecords ? (
                    <div className="popup" style={{ padding: "20px", height: "auto" }}>
                        正在加载聊天记录......
                        <button onClick={() => { closeFilter(); }}>
                            取消
                        </button>

                    </div>
                ) : (
                    <div className="historypopup" >
                        <FontAwesomeIcon className="closepopup" icon={faXmark} onClick={() => { setDisplayForwardMsgs(false); }} />
                        <div style={{ display: "flex", flexDirection: "column", height: "500px", overflowY: "auto", marginTop: "50px" }}>
                            {ForwardMsgs?.map((msg) => (
                                <div key={msg.msg_id} className={msg.chosen ? "msgchosen" : "msg"}>
                                    <div className={msg.sender_id !== myID ? "msgavatar" : "mymsgavatar"}>
                                        <img className="sender_avatar" src={msg.sender_avatar} />
                                    </div>
                                    <div id={`msg${msg.msg_id}`} className={msg.sender_id !== myID ? "msgmain" : "mymsgmain"}>
                                        <p className={msg.sender_id !== myID ? "sendername" : "mysendername"}>{msg.sender_name}</p>
                                        {msg.is_transmit === true ? (
                                            <p
                                                className={msg.sender_id !== myID ? "msgbody" : "mymsgbody"}
                                                onClick={() => {
                                                    openFilter(msg.msg_body);
                                                    setDisplayForwardMsgs(true);
                                                }}
                                                style={{ color: "#0baaf9" }}
                                            >
                                                点击查看合并转发的消息 共{countCommas(msg.msg_body)}条
                                            </p>
                                        ) :
                                            (msg.is_image === true ? <img src={msg.msg_body} alt="🏞️" style={{ maxWidth: "100%", height: "auto" }} /> :
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
                                            )}
                                        <p className={msg.sender_id !== myID ? "sendtime" : "mysendtime"}>{msg.create_time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            }
            {
                multiselecting && (
                    <div className="selectbuttons">
                        <button onClick={() => {
                            const msgdp = document.getElementById("msgdisplay");
                            if (msgdp) msgdp.className = "msgdpbox";
                            setMultiselected(true);
                            setMultiselecting(false);
                        }}>完成</button>
                        <button className="delete" onClick={() => {
                            const msgdp = document.getElementById("msgdisplay");
                            if (msgdp) msgdp.className = "msgdpbox";
                            setMultiselecting(false);
                            for (let msg of msgList) {
                                const id = msg.msg_id;
                                const targetbg = document.getElementById(`msgbg${id}`);
                                if (targetbg !== null) {
                                    targetbg.className = "msg";
                                }
                                // 点取消的移除事件监听器
                                for (let { id, listener } of eventListeners) {
                                    const target = document.getElementById(`msg${id}`);
                                    if (target !== null) {
                                        target.removeEventListener("click", listener);
                                    }
                                }
                            }
                        }}>取消</button>
                    </div>
                )
            }
            {
                multiselected && (
                    <div className="popup">
                        <FontAwesomeIcon className="closepopup" icon={faXmark} onClick={() => {
                            const msgdp = document.getElementById("msgdisplay");
                            if (msgdp) msgdp.className = "msgdpbox";
                            for (let msg of msgList) {
                                const id = msg.msg_id;
                                const targetbg = document.getElementById(`msgbg${id}`);
                                if (targetbg !== null) {
                                    targetbg.className = "msg";
                                }
                                // 点取消的移除事件监听器
                                for (let { id, listener } of eventListeners) {
                                    const target = document.getElementById(`msg${id}`);
                                    if (target !== null) {
                                        target.removeEventListener("click", listener);
                                    }
                                }
                            }
                            setMultiselected(false);
                        }} />
                        <p style={{ fontSize: "20px", margin: " 20px auto" }}>请选择要转发的聊天</p>
                        <div >
                            <select id="conversation-select" ref={selectRef}>
                                <option value="" disabled selected>
                                    请选择转发的目标
                                </option>
                                {convList.map((conv) => (
                                    <option key={conv.id} value={conv.id}>
                                        {conv.name} {conv.is_group === true ? "(群)" : "(私聊)"}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="sendforward" style={{ fontSize: "15px", width: "200px", margin: " 20px auto" }} onClick={() => sendForward()}>
                            发送选中的信息
                        </button>
                    </div>
                )
            }

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
                        if (event.key === "@" && isGroup === "1") {
                            event.preventDefault();
                            setShowPopupMention(true);
                            //验证是否为群聊
                            if (isGroup === "1") {
                                if (inputRef.current !== null) {
                                    const startPos = inputRef.current.selectionStart;
                                    const endPos = inputRef.current.selectionEnd;
                                    setMsg(inputValue);
                                    handleMention(event);
                                }
                            }
                        }
                        else {
                            setShowPopupMention(false);
                        }
                    }}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                />
                {showPopupMention && (
                    <div className="msgContextMenu">
                        {/* TODO:遍历群内好友 */}
                        {memberList.map((member) => (
                            <div key={member.user_id}>
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
                        <div>
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
                            <li className="ContextMenuLi" onClick={() => {
                                if (document.getElementById("msginput"))
                                    insertAtCursor(document.getElementById("msginput"), "");
                                setMsg(inputValue);
                                setShowPopupMention(false);
                            }}>
                                取消
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
                        <FontAwesomeIcon className="Icon" icon={faFilm} />
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
                    <button className={"sendbutton"} id="startCall" onClick={handleStartCall} style={{ zIndex: 9999 }}>
                        <FontAwesomeIcon className="Icon" icon={faVideo} />
                    </button>
                    <button className={currentVocalCall === chatID && globalValue ? "quitbutton" : "sendbutton"} id="startCall" onClick={globalValue && currentVocalCall === chatID ? handleFinishVocalCall : handleStartVocalCall} disabled={globalValue && currentVocalCall !== chatID} style={{ zIndex: 9999 }}>
                        <FontAwesomeIcon className="Icon" icon={faPhone} />
                    </button>
                </div>
                <button
                    className="msgbutton"
                    onClick={() => { sendPublic(); setInput(""); }}
                    style={{ display: "inline-block", verticalAlign: "middle" }}
                > <FontAwesomeIcon className="Icon" icon={faPaperPlane} /> </button>
            </div>
            {
                showEmojiPicker && (
                    <div className="emoji-picker-container" >
                        <Picker
                            onEmojiSelect={(emoji: { native: string }) => {
                                handleEmojiClick(emoji);
                            }}
                        />
                    </div>
                )
            }
        </div >
    ));
};

export default ChatScreen;