import React from "react";
import { useMeals } from "../../context/MealContext";
import { auth } from "../../services/firebase";

const UserProfile = () => {
  const { user, setCurrentUser } = useMeals();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center">
      {user.photoURL && (
        <img
          src={user.photoURL}
          alt={user.displayName || "Kullanıcı"}
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <div className="hidden md:block mr-2">
        <span className="text-sm font-medium">
          {user.displayName || "Kullanıcı"}
        </span>
      </div>
      <button
        onClick={handleSignOut}
        className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
      >
        Çıkış
      </button>
    </div>
  );
};

export default UserProfile;
