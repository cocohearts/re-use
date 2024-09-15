import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { Tables } from '../../database.types';
import { Skeleton } from "@/components/ui/skeleton"
import { CircleUser, MailOpen, MapPin, Star } from 'lucide-react';
import { get } from '@/lib/utils';

export default function SingleItem() {
  const { uuid } = useParams();
  const [item, setItem] = useState<Tables<'items'> | undefined>(undefined);
  const [seller, setSeller] = useState<Tables<'users'> | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    get("https://re-use.onrender.com/get-item/" + (uuid || ""))
      .then(data => {
        setItem(data.data)
        setLoading(false);
      }).catch(e => {
        setLoading(false);
        if (/404/.test(e)) {
          setNotFound(true);
        } else {
          console.log(e);
          setError(e.toString());
        }
      });
  }, [location])

  useEffect(() => {
    if (!item || !item.seller_id) return;
    setLoading(true);
    get("https://re-use.onrender.com/get-user/" + item.seller_id)
      .then(data => {
        setSeller(data.data)
        setLoading(false);
      }).catch(e => {
        setLoading(false);
        alert(e);
      });
  }, [item])

  return (
    item ? (
      <>
        {item.photo_urls && (
          <>
            <img src={item.photo_urls[photoIndex]} className="w-[200px] my-[14px] rounded-lg" />
            <div className="overflow-x-auto my-[14px] flex flex-row gap-2">
              {item.photo_urls.map((photo, index) => (
                <img onClick={() => setPhotoIndex(index)} src={photo} className={"cursor-pointer w-10 h-10 rounded-lg" + " " + (index === photoIndex ? "-inset-2 border-black border" : "opacity-50")} />
              ))}
            </div>
          </>
        )}
        <h1 className="text-xl my-2 text-pine-900">
          {item.name.slice(0,100)}
        </h1>
        <div className="text-lg my-2 text-pine-900">
          {item.quality}
        </div>
        <div className="text-lg my-2 text-pine-900">
          <MapPin className="inline" /> {item.location}
        </div>
        <div className="flex flex-col items-center justify-center">
          <button
            className={
              'w-[min(15rem,100%)] text-white text-lg text-center mt-[24px] py-[13px] rounded-lg' +
              ' ' +
              'bg-pine-900'
            }
            onClick={() => {
              // insert logic here that lets us create an offer.
            }}
          >
            make an offer
          </button>
          <div className="text-pine-900 text-lg text-opacity-50 py-[13px] flex flex-row items-center gap-2">
            <MailOpen className='inline' size={16} />
            <span>0 active offers</span>
          </div>
        </div>

        <hr className="border-pine-900 border-opacity-30 my-3" />
        <h1 className="text-xl my-2 text-pine-900">
          details
        </h1>
        <p className="text-base my-2">
          {item.description}
        </p>
        <p className="text-base my-3 text-gray-400">
          Posted on {new Date(item.created_at).toLocaleDateString()}
        </p>

        {
          seller && (
            <>
              <hr className="border-pine-900 border-opacity-30 my-3" />
              <h1 className="text-xl my-2 text-pine-900">
                seller
              </h1>
              <div className="flex flex-row justify-between mx-4 gap-3 items-center">
                <div className="flex flex-row gap-3 items-center">
                  {seller.pfp_url ? (
                    <img src={seller.pfp_url} className="h-10 w-10 rounded-full" />
                  ) : (
                    <CircleUser className="w-10 h-10" />
                  )}
                  <div className="text-pine-900 stroke-pine-900">
                    <div className="text-xl font-bold">{seller.name}</div>
                    <div className="text-base flex items-center gap-1">
                      <Star className="inline" />
                      <span>{Math.round(seller.karma || 0)} karma</span>
                    </div>
                  </div>
                </div>
                <div className="items-center flex flex-row">
                  <button className="rounded-lg px-4 py-2 bg-pine-900 text-white">
                    contact
                  </button>
                </div>
              </div>
            </>
          )
        }
      </>
    ) : loading ? (
      <>
        <Skeleton className="w-[200px] h-[100px] my-2 rounded-lg" />
        <div className="flex flex-row">
          {Array(2).map(_ => (
            <Skeleton className="w-10 h-10 my-2 rounded-lg" />
          ))}
        </div>
      </>
    ) : error ? (
      <div className="text-red-800 text-xl">An unexpected error was encountered!</div>
    ) : notFound ? (
      <div className="text-black text-xl">404 Not Found</div>
    ) : null
  )
}
