import { fireEvent, render } from "@testing-library/react";
import { useRouter } from "next/router";
import { act } from "react-dom/test-utils";
import "regenerator-runtime/runtime";
import Navbar from "../pages/user/navbar";
import "../utils/websocket";

// Mock the useRouter hook
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));
const mockRouter = { push: jest.fn() };
global.fetch = jest.fn();

// Mock the WebSocket methods
jest.mock("../utils/websocket", () => ({
    websocket: { readyState: 1, send: jest.fn() },
    createWebSocket: jest.fn(),
    closeWebSocket: jest.fn(),
}));

describe("Navbar component", () => {

    beforeAll(() => {
        window.alert = jest.fn();
        (useRouter as jest.Mock).mockImplementation(() => mockRouter);
        // Mock the fetch requests
        global.fetch = jest.fn(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
        ) as jest.Mock;
    });

    beforeEach(() => {
        // Set up the localStorage for the tests
        // (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
        localStorage.setItem("token", "test-token");
        
    });

    afterEach(() => {
        // Clean up the localStorage after each test
        localStorage.clear();
        jest.clearAllMocks();

    });

    it("should render the component", async() => {
        const { getByText } = render(<Navbar />);
        expect(getByText("消息")).toBeInTheDocument();
        expect(getByText("好友")).toBeInTheDocument();
        expect(getByText("登出")).toBeInTheDocument();

        await act(async () => {
            fireEvent.click(getByText("登出"));
        });

        expect(fetch).toHaveBeenCalledTimes(3);
        expect(fetch).toHaveBeenCalledWith("/api/user/logout/", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                token: localStorage.getItem("token"),
            }),
        });
        expect(mockRouter.push).toHaveBeenCalledTimes(2);
        expect(mockRouter.push).toHaveBeenCalledWith("/");
    });

    it("should call the userLogout function and push to home page when clicking the logout button", async () => {
        const { getByText } = render(<Navbar />);
        const logoutButton = getByText("登出");
        fireEvent.click(logoutButton);
        expect(fetch).toHaveBeenCalledWith("/api/user/logout/", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({ token: "test-token" }),
        });
        expect(mockRouter.push).toHaveBeenCalledWith("/");
        // expect(localStorage.getItem("token")).toBeNull();
        expect(getByText("消息")).toBeInTheDocument();
        expect(getByText("好友")).toBeInTheDocument();
    });
});
