import React, { useState } from "react";
import { useMeals } from "../../context/MealContext";

const AddMealForm = ({ onClose }) => {
  const { addPersonalMeal } = useMeals();
  const [formData, setFormData] = useState({
    name: "",
    type: "breakfast",
    description: "",
    calories: "",
    prepTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validasyon
      if (!formData.name.trim()) {
        throw new Error("Yemek adı gerekli");
      }

      // Sayısal değerleri dönüştür
      const mealData = {
        ...formData,
        calories: formData.calories ? parseInt(formData.calories) : 0,
        prepTime: formData.prepTime ? parseInt(formData.prepTime) : 0,
      };

      const result = await addPersonalMeal(mealData);

      if (result) {
        setSuccess(true);
        setFormData({
          name: "",
          type: "breakfast",
          description: "",
          calories: "",
          prepTime: "",
        });

        // 2 saniye sonra başarı mesajını kaldır
        setTimeout(() => {
          setSuccess(false);
          if (onClose) onClose();
        }, 2000);
      } else {
        throw new Error("Yemek eklenirken bir hata oluştu");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-bold mb-4">Kişisel Yemek Ekle</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          Yemek başarıyla eklendi!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Yemek Adı *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm"
            placeholder="Yemek adı"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Yemek Türü *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm"
            required
          >
            <option value="breakfast">Kahvaltı</option>
            <option value="lunch">Öğle</option>
            <option value="dinner">Akşam</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Açıklama</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm"
            placeholder="Yemek açıklaması"
            rows="2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kalori</label>
            <input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm"
              placeholder="Kalori"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Hazırlama Süresi (dk)
            </label>
            <input
              type="number"
              name="prepTime"
              value={formData.prepTime}
              onChange={handleChange}
              className="w-full p-2 border rounded text-sm"
              placeholder="Dakika"
              min="0"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded text-sm"
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded text-sm"
            disabled={loading}
          >
            {loading ? "Ekleniyor..." : "Ekle"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMealForm;
