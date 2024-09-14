import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { Database, Tables, Enums } from 'database.types';

export default function Browse() {
  const location = useLocation();
  const [error, setError] = useState<string | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<Tables<'items'>[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get("q");
    const page = parseInt(params.get("page") || "0") || 0;
    // implement logic to fetch the API for relevant queries and return the answer.
  }, [location])

  return (
    <>
      <h1 className="text-[24px]">browse listings</h1>
      <hr className="border-[#34412A] border-opacity-30" />
    </>
  );
}
