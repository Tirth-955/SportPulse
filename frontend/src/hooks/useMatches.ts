import { useState, useEffect, useMemo, useCallback } from "react";
import { Match } from "../types";
import { api } from "../services/api";

export function useMatches(pageSize: number = 5) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getMatches();
      setMatches(data);
    } catch (err: any) {
      setError(err.message || "Failed to load matches");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));

  // Ensure current page is valid when total pages change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedMatches = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return matches.slice(startIndex, startIndex + pageSize);
  }, [matches, currentPage, pageSize]);

  return {
    matches,
    pagedMatches,
    isLoading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    refreshMatches: fetchMatches,
  };
}
