import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
      get('/api/get-number-of-pages', {
        name: searchQuery,
      }),
      get('/api/search-items-by-name', {
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
          ? get('/api/get-user/' + (item.seller_id || ''))
          : new Promise((resolve, _) => resolve(undefined)),
      ),
    ).then((result) => {
      setSellers(result.map((seller) => seller?.data));
    });
  }, [items]);

  return (
    <div className="text-pine-900">
      <h1 className="mb-4 text-3xl">browse listings</h1>
      <>
        {loading ? (
          <div className="grid w-full grid-cols-2 grid-rows-2 gap-2">
            {[...Array(6)].map((_) => (
              <div className="flex flex-col gap-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {items.map((item, idx) => (
              <div
                className="my-2 w-full cursor-pointer overflow-clip duration-200 hover:scale-105"
                onClick={() => navigate('/item/' + item.id)}
                key={item.id}
              >
                <div className="mb-1 flex justify-start">
                  <img
                    src={item.photo_urls ? item.photo_urls[0] : '/vite.svg'}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                </div>
                <h2 className="text-base">{item.name}</h2>
                <p className="mb-1 text-sm">{item.quality}</p>
                <p className="flex items-start gap-2 text-sm">
                  <MapPin className="shrink-0" size={16} />
                  <span>{item.location}</span>
                </p>
                {sellers[idx] && (
                  <p className="flex items-center gap-2 text-sm">
                    <Star className="shrink-0" size={16} />
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
    </div>
  );
}
