import "../styles/globals.css";
import "../styles/login.css";
import "../styles/resetName.css";
import "../styles/friendlist.css";
import "../styles/navbar.css";
import "../styles/searchfriend.css";

import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps) => {
    return <Component {...pageProps} />;
};

export default App;
