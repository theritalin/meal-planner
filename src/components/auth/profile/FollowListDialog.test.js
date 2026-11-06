import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useParams } from "react-router-dom";
import FollowListDialog from "./FollowListDialog";

jest.mock("../../../services/firebase", () => ({
  getUserProfile: (uid) =>
    Promise.resolve(
      uid === "gone" ? null : { uid, displayName: `Kişi ${uid}`, photoURL: "" }
    ),
}));

const ProfileStub = () => <div>profil:{useParams().userId}</div>;

test("takipçileri listeler ve tıklanınca profile gider", async () => {
  const onClose = jest.fn();
  render(
    <MemoryRouter initialEntries={["/profile/me"]}>
      <Routes>
        <Route
          path="/profile/:userId"
          element={
            <>
              <ProfileStub />
              <FollowListDialog
                open
                onClose={onClose}
                title="Takipçiler"
                uids={["a1", "gone", "me"]}
                currentUid="me"
              />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
  expect(await screen.findByText("Kişi a1")).toBeTruthy();
  expect(screen.getByText("Kişi me (siz)")).toBeTruthy();
  fireEvent.click(screen.getByText("Kişi a1"));
  expect(onClose).toHaveBeenCalled();
  expect(screen.getByText("profil:a1")).toBeTruthy();
});

test("İngilizcede (you) etiketi ve Kapat düğmesi çevrilir", async () => {
  const { LanguageProvider } = require("../../../i18n");
  render(
    <LanguageProvider initialLang="en">
      <MemoryRouter>
        <FollowListDialog
          open
          onClose={() => {}}
          title="Followers"
          uids={["me"]}
          currentUid="me"
        />
      </MemoryRouter>
    </LanguageProvider>
  );
  expect(await screen.findByText("Kişi me (you)")).toBeTruthy();
  expect(screen.getByLabelText("Close")).toBeTruthy();
});
