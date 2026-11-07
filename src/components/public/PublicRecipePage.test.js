import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PublicRecipePage from "./PublicRecipePage";

const mockSaveRecipe = jest.fn(() => Promise.resolve([{}]));
let mockUser = null;

jest.mock("../../context/MealContext", () => ({
  useMeals: () => ({ user: mockUser }),
}));
jest.mock("../../context/recipes/RecipeContext", () => ({
  useRecipes: () => ({
    saveRecipe: mockSaveRecipe,
    isRecipeSaved: () => false,
  }),
}));
jest.mock("../../services/ads", () => ({ loadAdSense: jest.fn() }));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/tarifler/:slug" element={<PublicRecipePage />} />
        <Route path="/login" element={<div>giris-sayfasi</div>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  mockUser = null;
  mockSaveRecipe.mockReset();
  mockSaveRecipe.mockImplementation(() => Promise.resolve([{}]));
});

test("tarif başlığı ve malzemeler görünür", () => {
  renderAt("/tarifler/mercimek-corbasi");
  expect(
    screen.getByRole("heading", { level: 1, name: "Mercimek Çorbası" }),
  ).toBeTruthy();
  expect(screen.getByText("kırmızı mercimek")).toBeTruthy();
  expect(document.title).toContain("Mercimek Çorbası");
});

test("oturum yoksa kaydet butonu giriş sayfasına götürür", () => {
  renderAt("/tarifler/mercimek-corbasi");
  fireEvent.click(screen.getByRole("button", { name: /Tarif kitabıma kaydet/ }));
  expect(screen.getByText("giris-sayfasi")).toBeTruthy();
  expect(mockSaveRecipe).not.toHaveBeenCalled();
});

test("oturum açıksa tarif kullanıcının kitabına kaydedilir", async () => {
  mockUser = { uid: "u1" };
  renderAt("/tarifler/mercimek-corbasi");
  fireEvent.click(screen.getByRole("button", { name: /Tarif kitabıma kaydet/ }));
  await waitFor(() => expect(mockSaveRecipe).toHaveBeenCalled());
  const [uid, recipe] = mockSaveRecipe.mock.calls[0];
  expect(uid).toBe("u1");
  expect(recipe).toMatchObject({ id: "public-mercimek-corbasi", source: "public" });
  expect(await screen.findByText("Tarif kitabınıza kaydedildi.")).toBeTruthy();
});

test("bilinmeyen slug için bulunamadı durumu", () => {
  renderAt("/tarifler/olmayan-tarif");
  expect(screen.getByRole("heading", { level: 1, name: "Tarif bulunamadı" })).toBeTruthy();
});
