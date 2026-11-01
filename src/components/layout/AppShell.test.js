import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppShell from "./AppShell";

jest.mock("../../context/MealContext", () => ({
  useMeals: () => ({
    user: { uid: "u1", displayName: "Test", email: "t@example.com" },
  }),
}));
jest.mock("../auth/UserSearch", () => () => <input aria-label="arama-kutusu" />);
jest.mock("../auth/SignOut", () => () => null);
jest.mock("../ads/ConsentBanner", () => () => null);
jest.mock("../ads/AdBanner", () => ({ useNativeBanner: () => ({ bannerHeight: 0 }) }));
jest.mock("../../services/ads", () => ({ initAds: () => {} }));

const setMobile = (isMobile) => {
  window.matchMedia = (query) => ({
    matches: isMobile && query.includes("max-width"),
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  });
};

test("küçük ekranda kullanıcı arama ikonu görünür ve aramayı açar", () => {
  setMobile(true);
  render(
    <MemoryRouter>
      <AppShell>içerik</AppShell>
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole("button", { name: "Kullanıcı ara" }));
  expect(screen.getByLabelText("arama-kutusu")).toBeTruthy();
});
