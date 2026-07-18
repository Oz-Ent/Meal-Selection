import {render, screen} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Welcome from "../pages/Auth/Welcome";

describe("Welcome Component", () => { 
  it("renders the top image", () => {  
    render(<MemoryRouter><Welcome /></MemoryRouter>);
    const image = screen.getByAltText("Image of welcoming face and food.");
    expect(image).toBeInTheDocument();
  });


  it("renders welcome message", () => {
    render(<MemoryRouter><Welcome /></MemoryRouter>);
    const welcomeMessage = screen.getByText(/Welcome to Edziban/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<MemoryRouter><Welcome /></MemoryRouter>);
    const descriptionText = screen.getByText(/Choose what you want to eat this week and see your tasty selections come to life. Let's get started!/i);
    expect(descriptionText).toBeInTheDocument();
  });

  it("renders Login button", () => {
    render(<MemoryRouter><Welcome /></MemoryRouter>);
    const loginButton = screen.getByRole("button", { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it("renders Create an account link", () => {
    render(<MemoryRouter><Welcome /></MemoryRouter>);
    const createAccountLink = screen.getByText(/Create an account/i);
    expect(createAccountLink).toBeInTheDocument();
  });
});