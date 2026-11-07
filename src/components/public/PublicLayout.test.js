import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppShell from "../layout/AppShell";
import { isPublicContentPath } from "./PublicLayout";

let mockAuth = { user: null, authLoading: false };
jest.mock("../../context/MealContext", () => ({ useMeals: () => mockAuth }));
jest.mock("../auth/UserSearch", () => () => null);
jest.mock("../auth/SignOut", () => () => null);
jest.mock("../ads/ConsentBanner", () => () => null);
jest.mock("../ads/AdBanner", () => ({ useNativeBanner: () => ({ bannerHeight: 0 }) }));
jest.mock("../../services/ads", () => ({ initAds: () => {} }));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppShell>içerik</AppShell>
    </MemoryRouter>,
  );

test("içerik yolları tanınır", () => {
  expect(isPublicContentPath("/tarifler")).toBe(true);
  expect(isPublicContentPath("/tarifler/mercimek-corbasi")).toBe(true);
  expect(isPublicContentPath("/rehberler/x")).toBe(true);
  expect(isPublicContentPath("/hakkimizda")).toBe(true);
  expect(isPublicContentPath("/tariflerim")).toBe(false);
  expect(isPublicContentPath("/login")).toBe(false);
  expect(isPublicContentPath("/")).toBe(false);
});

test("oturum yokken içerik sayfasında herkese açık üst menü ve alt bilgi", () => {
  mockAuth = { user: null, authLoading: false };
  renderAt("/tarifler");
  expect(screen.getAllByRole("link", { name: "Giriş yap" }).length).toBeGreaterThan(0);
  expect(screen.getByText("bsckbilgi@gmail.com")).toBeTruthy();
  expect(screen.getByText("içerik")).toBeTruthy();
});

test("giriş sayfasında herkese açık menü gösterilmez", () => {
  mockAuth = { user: null, authLoading: false };
  renderAt("/login");
  expect(screen.queryByText("bsckbilgi@gmail.com")).toBeNull();
});

test("oturum açıkken normal uygulama kabuğu", () => {
  mockAuth = { user: { uid: "u1", displayName: "A" }, authLoading: false };
  renderAt("/tarifler");
  expect(screen.queryByText("bsckbilgi@gmail.com")).toBeNull();
  expect(screen.getByRole("button", { name: "Hesap menüsü" })).toBeTruthy();
});
