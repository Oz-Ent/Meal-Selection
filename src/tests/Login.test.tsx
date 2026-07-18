import {render, screen} from "@testing-library/react";
import Login from "../pages/Auth/Login/Login";

describe("Login Component", ()=> {  
  it("renders login heading", () => {
    render(<Login />);
    const heading = screen.getByRole("heading", { name: /Login/i });
    expect(heading).toBeInTheDocument(); 
  });

  it("renders description text", () => {
    render(<Login />);
    const description = screen.getByText(/Log in to choose your weekly meals. Create your ideal menu and make every meal a delight./i);
    expect(description).toBeInTheDocument();
  });   

  it("renders email input field", () => {
    render(<Login />);
    const emailInput = screen.getByLabelText(/Email/i);
    expect(emailInput).toBeInTheDocument();
  });

  it("renders password input field", () => {
    render(<Login />);
    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it("renders forgot password link", () => {
    render(<Login />);
    const forgotPasswordLink = screen.getByText(/Forgot Password\?/i);
    expect(forgotPasswordLink).toBeInTheDocument();
  });

    it("renders keep me signed in checkbox", () => {    
    render(<Login />);
    const checkbox = screen.getByLabelText(/Keep me signed in\./i);
    expect(checkbox).toBeInTheDocument();
  });

  it("renders login button", () => {
    render(<Login />);
    const loginButton = screen.getByRole("button", { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

    it("renders sign up link", () => {  
    render(<Login />);
    const signUpPrompt = screen.getByText(/Don't have an account\?/i);
    const signUpLink = screen.getByRole("link", { name: /Sign up/i });
    expect(signUpPrompt).toBeInTheDocument();
    expect(signUpLink).toBeInTheDocument();
  });
});

