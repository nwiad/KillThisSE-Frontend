import { render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import "regenerator-runtime/runtime";
import Navbar from "../pages/user/navbar";


// Mock the router
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

describe("Navbar", () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders the component", () => {
        render(<Navbar />);

        expect(screen.getByText("消息")).toBeInTheDocument();
        expect(screen.getByText("好友")).toBeInTheDocument();
        expect(screen.getByText("个人中心")).toBeInTheDocument();
        expect(screen.getByText("登出")).toBeInTheDocument();
    });
});