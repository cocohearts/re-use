import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { Tables } from 'database.types';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { get } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star } from 'lucide-react';

export default function Browse() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pageCount, setPageCount] = useState<number>(1);
  const [items, setItems] = useState<Tables<'items'>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sellers, setSellers] = useState<(Tables<'users'> | undefined)[]>([]);

  const params = new URLSearchParams(location.search);
  const page = parseInt(params.get('page') || '1') || 1;
  const searchQuery = (params.get('q') || '').trim();

  useEffect(() => {
    // implement logic to fetch the API for relevant queries and return the answer.
    setLoading(true);
    Promise.all([
      get('https://re-use.onrender.com/get-number-of-pages', {
        name: searchQuery,
      }),
      get('https://re-use.onrender.com/search-items-by-name', {
        name: searchQuery,
        page: page,
      }),
    ])
      .then(([page_result, items_result]) => {
        setLoading(false);
        setPageCount(page_result.data.total_pages);
        setItems(items_result.data);
      })
      .catch((e) => {
        setLoading(false);
        alert(e);
      });
  }, [location]);

  useEffect(() => {
    Promise.all(
      items.map((item) =>
        item.seller_id
          ? get(
              'https://re-use.onrender.com/get-user/' + (item.seller_id || ''),
            )
          : new Promise((resolve, _) => resolve(undefined)),
      ),
    ).then((result) => {
      setSellers(result.map((seller) => seller?.data));
    });
  }, [items]);

  return (
    <>
      <h1 className="text-[24px]">browse listings</h1>
      <hr className="border-pine-900 border-opacity-30" />
      <>
        {loading ? (
          <div className="grid grid-cols-2 grid-rows-2">
            {Array(4).map((_) => (
              <>
                <Skeleton className="h-96 max-w-[200px]" />
              </>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-6">
            {items.map((item, idx) => (
              <div className="my-2 max-w-[250px] hover:scale-105 overflow-clip duration-200 cursor-pointer" onClick={() => navigate("/item/" + item.id)}>
                <div className="flex justify-start">
                  <img src={item.photo_urls ? item.photo_urls[0] : "https://localhost:5173/vite.svg"} className="h-[200px] w-[200px] rounded-lg" />
                </div>
                <h2 className="text-base">{item.name}</h2>
                <p className="text-sm">{item.quality}</p>
                <p className="flex items-center gap-2 text-sm">
                  <MapPin size={20} />
                  <span>{item.location}</span>
                </p>
                {sellers[idx] && (
                  <p className="flex items-center gap-2 text-sm">
                    <Star size={20} />
                    <span>
                      seller has <strong>{sellers[idx].karma || 0}</strong>{' '}
                      karma
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {pageCount > 1 && (
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        navigate(`?q=${searchQuery}&page=${page - 1}`, {
                          replace: true,
                        })
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                </>
              )}
              <PaginationItem>
                <PaginationLink href="#">{page}</PaginationLink>
              </PaginationItem>
              {page < pageCount - 1 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        navigate(`?q=${searchQuery}&page=${page + 1}`, {
                          replace: true,
                        })
                      }
                    />
                  </PaginationItem>
                </>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </>
    </>
  );
}
