import { createMemoryRouter, RouterProvider } from "react-router";
import MasterLayout from "../layouts/MasterLayout/MasterLayout";
import HomePage from "../pages/HomePage/HomePage";
import NotFoundPage from "../pages/NotFound/NotFound";
import { mount } from "cypress/react";

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
    
    mount(<RouterProvider router={router} />);
    cy.contains("Home Page").should("be.visible");
  });

  it("renders NotFoundPage on unknown route", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/some/random/path"],
    });
    
    mount(<RouterProvider router={router} />);
    cy.contains("404 — Page Not Found").should("be.visible");
  });
});
