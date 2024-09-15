import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Tables } from '../../database.types';
import { Skeleton } from '@/components/ui/skeleton';
import { CircleUser, MailOpen, MapPin, Star } from 'lucide-react';
import { get } from '@/lib/utils';
import { useAuthContext } from '@/components/AuthProvider';

export default function SingleItem() {
  const { uuid } = useParams();
  const {user} = useAuthContext();
  const [item, setItem] = useState<Tables<'items'> | undefined>(undefined);
  const [seller, setSeller] = useState<Tables<'users'> | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    get('/api/get-item/' + (uuid || ''))
      .then((data) => {
        setItem(data.data);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        if (/404/.test(e)) {
          setNotFound(true);
        } else {
          console.log(e);
          setError(e.toString());
        }
      });
  }, [location]);

  useEffect(() => {
    if (!item || !item.seller_id) return;
    setLoading(true);
    get('/api/get-user/' + item.seller_id)
      .then((data) => {
        setSeller(data.data);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        alert(e);
      });
  }, [item]);

  return item ? (
    <>
      {item.photo_urls && (
        <>
          <img
            src={item.photo_urls[photoIndex]}
            className="my-[14px] w-[200px] rounded-lg"
          />
          <div className="my-[14px] flex flex-row gap-2 overflow-x-auto">
            {item.photo_urls.map((photo, index) => (
              <img
                onClick={() => setPhotoIndex(index)}
                src={photo}
                className={
                  'h-10 w-10 cursor-pointer rounded-lg' +
                  ' ' +
                  (index === photoIndex
                    ? '-inset-2 border border-black'
                    : 'opacity-50')
                }
              />
            ))}
          </div>
        </>
      )}
      <h1 className="my-2 text-xl text-pine-900">{item.name.slice(0, 100)}</h1>
      <div className="my-2 text-lg text-pine-900">{item.quality}</div>
      <div className="my-2 text-lg text-pine-900">
        <MapPin className="inline" /> {item.location}
      </div>
      <div className="flex flex-col items-center justify-center">
        {user?.id && (seller?.id !== user?.id) &&
          <button
            className={
              'mt-[24px] w-[min(15rem,100%)] rounded-lg py-[13px] text-center text-lg text-white' +
              ' ' +
              (user ? 'bg-pine-900' : 'bg-gray-500')
            }
            onClick={() => {
              // insert logic here that lets us create an offer.
            }}
          >
            make an offer
          </button>
        }
        <div className="flex flex-row items-center gap-2 py-[13px] text-lg text-pine-900 text-opacity-50">
          <MailOpen className="inline" size={16} />
          <span>0 active offers</span>
        </div>
      </div>

      <hr className="my-3 border-pine-900 border-opacity-30" />
      <h1 className="my-2 text-xl text-pine-900">details</h1>
      <p className="my-2 text-base">{item.description}</p>
      <p className="my-3 text-base text-gray-400">
        Posted on {new Date(item.created_at).toLocaleDateString()}
      </p>

      {seller && (
        <>
          <hr className="my-3 border-pine-900 border-opacity-30" />
          <h1 className="my-2 text-xl text-pine-900">seller</h1>
          <div className="mx-4 flex flex-row items-center justify-between gap-3">
            <div className="flex flex-row items-center gap-3">
              {seller.pfp_url ? (
                <img src={seller.pfp_url} className="h-10 w-10 rounded-full" />
              ) : (
                <CircleUser className="h-10 w-10" />
              )}
              <div className="stroke-pine-900 text-pine-900">
                <div className="text-xl font-bold">{seller.name}</div>
                <div className="flex items-center gap-1 text-base">
                  <Star className="inline" />
                  <span>{Math.round(seller.karma || 0)} karma</span>
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center">
              <button className="rounded-lg bg-pine-900 px-4 py-2 text-white">
                contact
              </button>
            </div>
          </div>
        </>
      )}
    </>
  ) : loading ? (
    <>
      <Skeleton className="my-2 h-[100px] w-[200px] rounded-lg" />
      <div className="flex flex-row">
        {Array(2).map((_) => (
          <Skeleton className="my-2 h-10 w-10 rounded-lg" />
        ))}
      </div>
    </>
  ) : error ? (
    <div className="text-xl text-red-800">
      An unexpected error was encountered!
    </div>
  ) : notFound ? (
    <div className="text-xl text-black">404 Not Found</div>
  ) : null;
}
