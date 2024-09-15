import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Tables } from '../../database.types';
import { Skeleton } from '@/components/ui/skeleton';
import { CircleUser, MailOpen, MapPin, Star } from 'lucide-react';
import { get, post } from '@/lib/utils';
import { useAuthContext } from '@/components/AuthProvider';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import ProfilePicture from '@/components/ProfilePicture';
import { DialogClose } from '@radix-ui/react-dialog';
import { Input } from '@/components/ui/input';

export default function SingleItem() {
  const { uuid } = useParams();
  const { user } = useAuthContext();
  const [item, setItem] = useState<Tables<'items'> | undefined>(undefined);
  const [seller, setSeller] = useState<Tables<'users'> | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [bids, setBids] = useState<Tables<'bids'>[]>([]);
  const [bidUsers, setBidUsers] = useState<(Tables<'users'> | undefined)[]>([]);

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

  useEffect(() => {
    if (!item || !item.seller_id) return;
    setLoading(true);
    get('/api/get-bids-for-item/' + item.id)
      .then((data) => {
        setBids(data.data);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        alert(e);
      });
  }, [item]);

  useEffect(() => {
    get('/api/get-multiple-users', { userids: bids.map((x) => x.bidder_id) })
      .then((resp) => setBidUsers(resp.data))
      .catch(alert);
  }, [bids]);

  const toggleBid = () => {
    if (!user || !item) return;
    if (bids.find((x) => x.bidder_id === user.id) !== undefined) {
      post('/api/cancel-bid/' + item.id, {})
        .then((resp) => {
          setBids(resp.data);
        })
        .catch(alert);
    } else {
      post('/api/bid-for-item/' + item.id, {})
        .then((resp) => {
          setBids(resp.data);
        })
        .catch(alert);
    }
  };

  const acceptBid = (bid: Tables<'bids'>) => {
    if (!user || !item) return;
    post('/api/accept-bid/' + bid.id, {})
      .then((resp) => {
        console.log('accept bid data:', resp.data);
        console.log('all bids before:', bids);
        if (resp.data.length === 0) return;
        const updatedBid: Tables<'bids'> = resp.data.data[0];
        setBids((bids) =>
          bids.map((b) => (b.id === updatedBid.id ? updatedBid : b)),
        );
      })
      .catch(alert);
  };

  const [rating, setRating] = useState<number>(3);

  return item ? (
    <>
      {item.photo_urls && (
        <>
          <img
            src={item.photo_urls[photoIndex]}
            className="mx-auto my-[14px] h-60 rounded-lg"
          />
          <div className="my-[14px] flex flex-row gap-2 overflow-x-auto">
            {item.photo_urls.map((photo, index) => (
              <img
                onClick={() => setPhotoIndex(index)}
                src={photo}
                className={
                  'h-10 w-10 cursor-pointer rounded-lg object-cover' +
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
      <div className="my-2 flex items-center gap-2 text-lg text-pine-900">
        <MapPin className="inline" size={16} /> {item.location}
      </div>
      <div className="flex flex-col items-center justify-center">
        {user?.id && seller?.id !== user?.id && (
          <button
            className={
              'mt-[24px] w-[min(15rem,100%)] rounded-lg py-[13px] text-center text-lg text-white' +
              ' ' +
              (user ? 'bg-pine-900' : 'bg-gray-500')
            }
            onClick={() => {
              toggleBid();
            }}
          >
            {bids.findIndex((x) => user && x.bidder_id === user.id) === -1
              ? 'make an offer'
              : 'cancel offer'}
          </button>
        )}
        <div className="flex flex-row items-center gap-2 py-[13px] text-lg text-pine-900 text-opacity-50">
          <MailOpen className="inline" size={16} />
          <Dialog>
            <DialogTrigger asChild>
              <span className="cursor-pointer">
                {bids.length} active offers (
                {bids.filter((b) => b.accepted).length} accepted)
              </span>
            </DialogTrigger>
            <DialogContent className="w-11/12 rounded-lg">
              <DialogHeader>
                <DialogTitle>active offers</DialogTitle>
                <DialogDescription>all active offers</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3">
                {bids.map((bid, idx) => (
                  <>
                    <div className="col-span-2">
                      <div className="flex flex-row items-center justify-between gap-3">
                        <div className="flex flex-row items-center gap-3">
                          {bidUsers[idx] ? (
                            <ProfilePicture user={bidUsers[idx]} />
                          ) : (
                            <CircleUser className="h-10 w-10" />
                          )}
                          <div className="stroke-pine-900 text-pine-900">
                            <div className="text-base font-bold md:text-xl">
                              {bidUsers[idx]?.name}
                            </div>
                            <div className="flex items-center gap-1 text-base">
                              <Star className="inline" size={16} />
                              <span>
                                {Math.round(bidUsers[idx]?.karma || 0)}
                                &nbsp;karma
                              </span>
                            </div>

                            <div className="flex flex-row items-center opacity-60">
                              {new Date(bid.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      {user && user.id === item.seller_id && !bid.accepted ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className={'bg-pine-900 text-white'}>
                              Accept Bid
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Accepting Bid?</DialogTitle>
                            </DialogHeader>
                            <div className="flex gap-2">
                              <DialogClose>
                                <Button variant="filled">Cancel</Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => acceptBid(bid)}
                                >
                                  Confirm
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : user &&
                        (user.id === bid.bidder_id ||
                          user.id === item.seller_id) &&
                        bid.accepted ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className={'text-pine-900'} variant="ghost">
                              Rate Bid
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Rate your reuse experience!
                              </DialogTitle>
                            </DialogHeader>
                            <label className="text-[16px]">rating</label>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              className="mt-[8px]"
                              placeholder="rating"
                              value={rating}
                              onChange={(e) => {
                                setRating(parseInt(e.target.value) || 0);
                              }}
                            />
                            <div className="flex gap-2">
                              <DialogClose>
                                <Button variant="filled">Cancel</Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    post(
                                      '/api/review-user/' +
                                        bid.id +
                                        `?review=${rating}&reviewee_id=${
                                          user.id === bid.bidder_id
                                            ? item.seller_id
                                            : bid.bidder_id
                                        }`,
                                    ).catch(alert);
                                  }}
                                >
                                  Confirm
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : bid.accepted ? (
                        <div className="text-gray-800">Bid Accepted</div>
                      ) : null}
                    </div>
                  </>
                ))}
              </div>
            </DialogContent>
          </Dialog>
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
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex flex-row items-center gap-3">
              {seller.pfp_url ? (
                <img src={seller.pfp_url} className="h-10 w-10 rounded-full" />
              ) : (
                <CircleUser className="h-10 w-10 stroke-1" />
              )}
              <div className="stroke-pine-900 text-pine-900">
                <div className="text-base font-bold">
                  {seller.name || seller.email}
                </div>
                <div className="flex items-center gap-1 text-base">
                  <Star className="inline" size={16} />
                  <span>{Math.round(seller.karma || 0)} karma</span>
                </div>
              </div>
            </div>
            <div className="flex flex-row items-center">
              <a
                className={buttonVariants({ variant: 'filled' })}
                href={`mailto:${seller.email}`}
              >
                contact
              </a>
            </div>
          </div>
        </>
      )}
    </>
  ) : loading ? (
    <>
      <Skeleton className="my-2 h-60 w-full rounded-lg" />
      <div className="mt-2 flex flex-row gap-2">
        {[...Array(2)].map((_) => (
          <Skeleton className="my-2 h-10 w-10 rounded-lg" />
        ))}
      </div>
      <Skeleton className="my-2 h-6 w-full rounded-lg" />
      <Skeleton className="my-2 h-6 w-1/2 rounded-lg" />
      <Skeleton className="my-2 h-6 w-3/4 rounded-lg" />
      <hr />
      <Skeleton className="my-2 h-6 w-1/4 rounded-lg" />
      <Skeleton className="my-2 h-6 w-1/2 rounded-lg" />
      <Skeleton className="my-2 h-6 w-3/4 rounded-lg" />
    </>
  ) : error ? (
    <div className="text-xl text-red-800">
      An unexpected error was encountered!
    </div>
  ) : notFound ? (
    <div className="text-xl text-black">404 Not Found</div>
  ) : null;
}
