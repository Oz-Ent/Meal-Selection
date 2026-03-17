import { createMemoryRouter, RouterProvider } from "react-router";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { routes } from "../router";

describe("Router", () => {
  it("renders HomePage on '/'", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
    });
    
    render(<RouterProvider router={router} />);
    expect(screen.getByText(/Home Page/i)).toBeVisible();
  });

  it("renders NotFoundPage on unknown route", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/some/random/path"],
    });
    
    render(<RouterProvider router={router} />);
    expect(screen.getByText(/404 — Page Not Found/i)).toBeVisible();
  });
});
