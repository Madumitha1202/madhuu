import { useCallback, useEffect, useMemo, useState } from "react";
import { getMovies } from "../api/client";

export default function useMovies() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMovies();
      setMovies(data);
      console.info("[MOVIES] Loaded", data.length, "movies from REST API");
    } catch (err) {
      console.error("[MOVIES] Load failed", err);
      setError("Could not load movies. Make sure the API server is running in another terminal.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMovies(); }, [loadMovies]);

  const genres = useMemo(() => ["All", ...new Set(movies.map((movie) => movie.genre))], [movies]);
  const filteredMovies = useMemo(() => movies.filter((movie) => {
    const matchTitle = movie.title.toLowerCase().includes(search.toLowerCase().trim());
    const matchGenre = genre === "All" || movie.genre === genre;
    return matchTitle && matchGenre;
  }), [movies, search, genre]);

  return { movies, genres, filteredMovies, search, setSearch, genre, setGenre, loading, error, reload: loadMovies };
}
