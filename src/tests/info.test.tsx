import { render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import { act } from "react-dom/test-utils";
import "regenerator-runtime/runtime";
import InitPage from "../pages/user/info";

// Mock the router
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

describe("InitPage component", () => {
    
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
        (global as any).fetch = jest.fn(()=>
            Promise.resolve({
                json: () => Promise.resolve({
                    name: "Test User",
                    avatar: "test-avatar.png",
                }),
            })
        );     
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders the component without errors", () => {
        act(()=>{
            render(<InitPage />);
        });
        expect(screen.getByText(/修改头像/i)).toBeInTheDocument();
        expect(screen.getByText(/修改用户名/i)).toBeInTheDocument();
        expect(screen.getByText(/修改密码/i)).toBeInTheDocument();
        expect(screen.getByText(/注销本用户/i)).toBeInTheDocument();
    });
});