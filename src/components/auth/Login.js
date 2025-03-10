import React, { useState, useEffect } from "react";
import { signInWithGoogle, checkAndAddUser } from "../../services/firebase";
import { useMeals } from "../../context/MealContext";

const Login = () => {
  const { setCurrentUser } = useMeals();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializeStatus, setInitializeStatus] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Google ile giriş yap
      const user = await signInWithGoogle();

      // Kullanıcıyı kontrol et ve gerekirse ekle
      await checkAndAddUser(user);

      // Kullanıcı durumunu güncelle
      setCurrentUser(user);
    } catch (err) {
      console.error("Giriş yaparken hata oluştu:", err);
      setError(
        "Google ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Yemek Planlayıcı
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Haftalık yemek planınızı oluşturmak ve yönetmek için giriş yapın.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {initializeStatus === "success" && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Varsayılan yemekler başarıyla yüklendi!
          </div>
        )}

        {initializeStatus === "error" && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Varsayılan yemekler yüklenirken bir hata oluştu.
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{loading ? "Giriş yapılıyor..." : "Google ile Giriş Yap"}</span>
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Giriş yaparak, yemek planlarınızı kaydedebilir ve her cihazdan
            erişebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
