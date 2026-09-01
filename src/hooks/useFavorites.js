import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchFavorites, addFavorite, removeFavorite } from '../services/api';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(async () => {
    if (!user?.token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchFavorites(user.token);
      setFavorites(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = async (termId) => {
    if (!user?.token) return { success: false, error: "LOGIN_REQUIRED" };

    const existing = favorites.find(f => f.termId === termId || f.id === termId);
    try {
      if (existing) {
        await removeFavorite(user.token, existing.favoriteId || existing.id);
        setFavorites(prev => prev.filter(f => f.termId !== termId && f.id !== termId));
        return { success: true, action: 'removed' };
      } else {
        const newFav = await addFavorite(user.token, termId);
        setFavorites(prev => [newFav, ...prev]);
        return { success: true, action: 'added' };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const isFavorite = (termId) => {
    return favorites.some(f => f.termId === termId || f.id === termId);
  };

  return {
    favorites,
    isLoading,
    error,
    refreshFavorites: loadFavorites,
    toggleFavorite,
    isFavorite
  };
}
