import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { Tables } from '../../database.types';
import { Skeleton } from "@/components/ui/skeleton"
import { CircleUser, MapPin, Star } from 'lucide-react';

export default function SingleItem() {
  const { uuid } = useParams();
  const [item, setItem] = useState<Tables<'items'> | undefined>(undefined);
  const [seller, setSeller] = useState<Tables<'users'> | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [photoIndex, setPhotoIndex] = useState<number>(0);

  useEffect(() => {
    supabase
      .from('items')
      .select()
      .eq('id', uuid || "")
      .then(({data, error}) => {
        setLoading(false);
        if (error) {
          setError(error.message)
        } else if (!data || data.length !== 0) {
          setNotFound(true);
        }
        setItem(data![0])
      })
  }, [])

  useEffect(() => {
    if (!item) return;
    supabase
      .from('users')
      .select()
      .eq('id', item.seller_id || "")
      .then(({data, error}) => {
        if (error) {
          setError(error.message)
        } else if (!data || data.length !== 0) {
          setNotFound(true);
        }
        setSeller(data![0])
      })
  }, [item])

  return (
    item ? (
      <>
        {item.photo_urls && (
          <>
            <img src={item.photo_urls[photoIndex]} className="w-[200px] my-[14px]" />
            <div className="overflow-x-auto my-[14px]">
              {item.photo_urls.map((photo, index) => (
                <img onClick={() => setPhotoIndex(index)} src={photo} className={"cursor-pointer w-5 h-5 rounded-lg" + " " + (index === photoIndex ? "-inset-2 border-black border" : "opacity-50")} />
              ))}
            </div>
          </>
        )}
        <h1 className="text-xl my-2">
          {item.name.slice(0,100)}
        </h1>
        <div className="text-lg my-2">
          {item.quality}
        </div>
        <div className="text-lg my-2">
          <MapPin /> {item.location}
        </div>
        <button
          className={
            'w-full text-white text-lg text-center mt-[24px] py-[13px] rounded-lg' +
            ' ' +
            'bg-green-700'
          }
          onClick={() => {
            // insert logic here that lets us create an offer.
          }}
        >
          make an offer
        </button>

        <hr className="border-pine-900 border-opacity-30 my-3" />
        <h1 className="text-xl my-2">
          details
        </h1>
        <p className="text-base my-2">
          {item.description}
        </p>
        <p className="text-base my-3 bg-gray-400">
          Posted on {new Date(item.created_at).toLocaleDateString()}
        </p>

        {
          seller && (
            <>
              <hr className="border-pine-900 border-opacity-30 my-3" />
              <h1 className="text-xl my-2">
                seller
              </h1>
              <div className="flex flex-row justify-between mx-4 gap-3 items-center">
                <div className="flex flex-row gap-3 items-center">
                  {seller.pfp_url ? (
                    <img src={seller.pfp_url} className="h-5 w-5 rounded-full" />
                  ) : (
                    <CircleUser className="h-5 w-5" />
                  )}
                  <div className="text-pine-900 stroke-pine-900">
                    <div className="text-xl font-bold">{seller.name}</div>
                    <div className="text-base">
                      <Star />
                      {Math.round(seller.karma || 0)} karma
                    </div>
                  </div>
                </div>
                <div className="items-center flex flex-row">
                  <button className="rounded-lg mx-4 my-2 bg-pine-900 text-white">
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
            <Skeleton className="w-5 h-5 my-2 rounded-lg" />
          ))}
        </div>
      </>
    ) : error ? (
      <div className="text-red-800 text-xl">{error}</div>
    ) : notFound ? (
      <div className="text-black text-xl">404 Not Found</div>
    ) : null
  )
}
