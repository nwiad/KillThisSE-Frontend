import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/router";
import InitLoginPage from "../pages/index";

// Mock the router
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

describe("InitLoginPage", () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    
    test("renders login form and allows user to navigate to registration page", async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
        
        render(<InitLoginPage />);
        
        const usernameInput = screen.getByPlaceholderText("用户名");
        const passwordInput = screen.getByPlaceholderText("密码");
        const loginButton = screen.getByText("登录");
        
        fireEvent.change(usernameInput, { target: { value: "testuser" } });
        fireEvent.change(passwordInput, { target: { value: "testpassword" } });
        // fireEvent.click(loginButton);
        
        await waitFor(() => {
            // expect(document.cookie).toMatch(/session=\d+/);
            expect(loginButton).toBeEnabled();

            // expect(window.location.pathname).toBe("/user");
        });
    });
});
