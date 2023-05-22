// tests/InitPage.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import "regenerator-runtime/runtime";
import InitPage from "../pages/register";

// Mock the router
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

describe("InitPage", () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders the component", () => {
        render(<InitPage />);

        expect(screen.getByText("欢迎，新的杀软er")).toBeInTheDocument();
        expect(screen.getByText("请在下方填写您的注册信息")).toBeInTheDocument();
    });

    test("validates the name and password and enables the register button", async () => {
        render(<InitPage />);

        // Find input elements
        const usernameInput = screen.getByPlaceholderText("用户名");
        const passwordInput = screen.getByPlaceholderText("密码");
        const repeatPasswordInput = screen.getByPlaceholderText("请重复密码");
        const registerButton = screen.getByText("注册新用户");

        // Check if the register button is initially disabled
        expect(registerButton).toBeDisabled();

        // Enter valid name and password
        fireEvent.change(usernameInput, { target: { value: "test_user" } });
        fireEvent.change(passwordInput, { target: { value: "test_password" } });
        fireEvent.change(repeatPasswordInput, { target: { value: "test_password" } });
        // fireEvent.click(registerButton);

        // Wait for validation updates
        await waitFor(() => {
            expect(registerButton).toBeEnabled();
        });
    });
});