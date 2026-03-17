import { createMemoryRouter, RouterProvider } from "react-router";
import MasterLayout from "../layouts/MasterLayout/MasterLayout";
import HomePage from "../pages/HomePage/HomePage";
import NotFoundPage from "../pages/NotFound/NotFound";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Define the same routes as your real router
const routes = [
  {
    path: "/",
    element: <MasterLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

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
