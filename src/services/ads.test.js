import { isAdEligiblePath } from "./ads";

describe("isAdEligiblePath (AdSense yalnızca içerik sayfalarında)", () => {
  test.each([
    ["/", false, true],
    ["/", true, false],
    ["/tarifler", true, true],
    ["/tarifler/", false, true],
    ["/tarifler/mercimek-corbasi", false, true],
    ["/rehberler", false, true],
    ["/rehberler/haftalik-yemek-plani-nasil-hazirlanir", true, true],
    ["/hakkimizda", false, true],
    ["/login", false, false],
    ["/privacy", false, false],
    ["/recipes", true, false],
    ["/export", true, false],
    ["/profile/abc", false, false],
    ["/tariflerim", false, false],
  ])("%s (oturum: %s) → %s", (path, signedIn, expected) => {
    expect(isAdEligiblePath(path, signedIn)).toBe(expected);
  });

  test("varsayılan: location + localStorage.mp_signed_in", () => {
    window.history.pushState({}, "", "/");
    window.localStorage.setItem("mp_signed_in", "1");
    expect(isAdEligiblePath()).toBe(false);
    window.localStorage.removeItem("mp_signed_in");
    expect(isAdEligiblePath()).toBe(true);
  });
});
