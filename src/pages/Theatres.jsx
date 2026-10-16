import { useEffect, useState } from "react";
import { getTheatres } from "../api/client";
import { Loading, ErrorMessage } from "../components/UI";

export default function Theatres() {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getTheatres().then(setTheatres).catch(() => setError("Could not load theatres. Start the API server.")).finally(() => setLoading(false)); }, []);
  return <main className="page"><p className="eyebrow">LOCATIONS</p><h1>Theatres</h1>
    {loading && <Loading />}{error && <ErrorMessage>{error}</ErrorMessage>}
    <div className="theatre-grid">{theatres.map((t) => <article className="theatre-card" key={t.id}><h2>{t.name}</h2><p>{t.location}</p><p>Shows: {t.shows.join(" · ")}</p></article>)}</div>
  </main>;
}