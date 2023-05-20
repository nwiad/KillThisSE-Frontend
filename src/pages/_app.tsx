import "../styles/globals.css";
import "../styles/login.css";
import "../styles/resetName.css";
import "../styles/friendlist.css";
import "../styles/msglist.css";
import "../styles/navbar.css";
import "../styles/searchfriend.css";
import "../styles/requests.css";
import "../styles/friendinfo.css";
import "../styles/startgroup.css";
import "../styles/chatinfo.css";
import {GlobalContextProvider} from "../constants/GlobalContext";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

library.add(faComment);

import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
    return (
        <GlobalContextProvider>
            <Component {...pageProps} />
        </GlobalContextProvider>
    );
};

export default App;
