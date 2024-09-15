import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase from '@/lib/supabase';
import { cn, post } from '@/lib/utils';
import { useAuthContext } from '@/components/AuthProvider';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';

export default function AddItemPage() {
  const photoUploadRef: any = useRef(null);
  const [photos, setPhotos] = useState<
    {
      src: string;
      id: string;
      file: File;
      uploaded: boolean;
      filename: string;
      publicUrl: string | null;
    }[]
  >([]);
  const [itemQuality, setItemQuality] = useState<string>('unspecified');
  const [itemName, setItemName] = useState<string>('');
  const [itemLocation, setItemLocation] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemTags, setItemTags] = useState<string>('');
  const [itemSelfPickup, setItemSelfPickup] = useState<boolean>(false);
  const [readyToList, setReadyToList] = useState<boolean>(false);
  const [isSubmittingItem, setIsSubmittingItem] = useState<boolean>(false);

  const navigate = useNavigate();

  const { user, token: authToken } = useAuthContext();

  useEffect(() => {
    setReadyToList(
      photos.length > 0 &&
        photos.reduce(
          (good: boolean, photo: any) =>
            good && photo.publicUrl && photo.uploaded,
          true,
        ) &&
        itemName.trim() !== '' &&
        itemLocation.trim() !== '' &&
        itemDescription.trim() !== '',
    );
  }, [itemQuality, itemName, itemLocation, itemDescription, itemTags, photos]);

  const onPhotoUpload = async (e: any) => {
    const { files }: { files: File[] } = e.target;
    if (files.length === 0) return;

    // Process each file and add it to the `photos` state array
    await Promise.all(
      Array.from(files).map(async (file: File) => {
        const reader = new FileReader();
        const photoId = uuidv4();

        // Extract extension from file
        const fileExtension = file.name.split('.').pop();
        if (!fileExtension) return;

        const photoFilename = `${photoId}.${fileExtension}`;

        // Add file to lsit of photos and upload
        reader.onload = async (e) => {
          if (!e || !e.target) return;
          setPhotos((photos) => [
            ...photos,
            {
              src: e.target?.result as string,
              id: photoId,
              filename: photoFilename,
              file,
              uploaded: false,
              publicUrl: null,
            },
          ]);

          // Upload file to supabase storage
          const { data, error } = await supabase.storage
            .from('item_photos')
            .upload(photoFilename, file, {
              cacheControl: '3600',
              upsert: true,
            });

          if (error || !data || data?.fullPath === undefined) {
            removePhoto(photoId);
            return;
          }

          // Get public URL of photo
          const { publicUrl } = supabase.storage
            .from('item_photos')
            .getPublicUrl(data.path).data;

          setPhotos((photos) =>
            photos.map((photo) => {
              if (photo.id !== photoId) return photo;
              return { ...photo, uploaded: true, publicUrl };
            }),
          );
        };
        reader.readAsDataURL(file);
      }),
    );
  };

  const removePhoto = async (id: string) => {
    const photo = photos.find((photo) => photo.id === id);
    if (!photo) return;
    setPhotos((photos) => photos.filter((photo) => photo.id !== id));
    await supabase.storage.from('item_photos').remove([photo.filename]);
  };

  const submitListing = async () => {
    // Grab ALL the information
    if (!readyToList) return;
    const postBody = {
      seller_id: user?.id,
      quality: itemQuality,
      name: itemName,
      description: itemDescription,
      photo_urls: photos.map((photo) => photo.publicUrl),
      tags: itemTags.split(',').map((tag) => tag.trim()),
      location: itemLocation,
      can_self_pickup: itemSelfPickup,
    };
    console.log('posting to /api/create-item...');
    console.log('body:', postBody);
    setIsSubmittingItem(true);

    try {
      const res = await post('/api/create-item', postBody);
      console.log('done.');
      console.log(res);

      const itemId = res.data.data[0].id;
      navigate(`/item/${itemId}`);
    } catch {
      setIsSubmittingItem(false);
    }
  };

  return (
    <div className="text-pine-900">
      <h1 className="mb-4 text-3xl">list an item</h1>

      {/* Photos */}
      <span className="">photos * ({photos.length}/10)</span>
      <div className="mb-4 mt-1.5 flex flex-col overflow-x-auto">
        <div className="flex h-40 gap-4">
          {/* All the photos in an array */}
          {photos.map((photo) => {
            return (
              <div
                className="relative h-full w-40 shrink-0 overflow-hidden rounded-md"
                key={photo.id}
              >
                {/* Overlay */}
                <div
                  className={cn(
                    photo.uploaded ? 'opacity-0' : 'opacity-80',
                    'absolute z-10 flex h-full w-full items-center justify-center bg-neutral-900 text-white transition-all duration-1000',
                  )}
                >
                  uploading...
                </div>
                {/* Delete button */}
                <button
                  className="absolute right-2 top-2 z-10 rounded-full bg-neutral-900/30"
                  onClick={() => removePhoto(photo.id)}
                >
                  <X className="stroke-white p-0.5" />
                </button>
                <img
                  className={cn(
                    'mx-auto h-full object-cover transition-all',
                    photo.publicUrl ? 'blur-0' : 'blur-sm',
                  )}
                  src={photo.publicUrl || photo.src}
                />
              </div>
            );
          })}
          <Button
            className="flex h-full w-40 shrink-0 flex-col gap-1"
            variant="default"
            onClick={() => photoUploadRef?.current?.click()}
            disabled={photos.length >= 10}
          >
            <Plus />
            <span>add photo</span>
          </Button>
        </div>
      </div>

      {/* Invisible photo upload element */}
      <input
        className="hidden"
        type="file"
        ref={photoUploadRef}
        onChange={onPhotoUpload}
        multiple
        accept="image/jpeg, image/png"
      />

      {/* Form */}
      <div className="mb-8 flex flex-col gap-4">
        {/* Name */}
        <div>
          <Label htmlFor="name-input">item name *</Label>
          <Input
            className="mt-1"
            id="name-input"
            placeholder="gallon of hand sanitizer"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setItemName(e.target.value)}
          />
        </div>
        {/* Quality */}
        <div>
          <Label htmlFor="quality-input">quality</Label>
          <Select onValueChange={(value) => setItemQuality(value)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="select one" />
            </SelectTrigger>
            <SelectContent id="quality-input">
              <SelectItem value="new">new</SelectItem>
              <SelectItem value="like new">like new</SelectItem>
              <SelectItem value="good">good</SelectItem>
              <SelectItem value="bad">decent</SelectItem>
              <SelectItem value="unspecified">unspecified</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Location */}
        <div>
          <Label htmlFor="location-input">pickup location *</Label>
          <Input
            className="mt-1"
            id="location-input"
            placeholder="masseeh hall, room 4510"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setItemLocation(e.target.value)}
          />
        </div>
        {/* Description */}
        <div>
          <Label htmlFor="description-input">description *</Label>
          <Textarea
            className="mt-1"
            id="description-input"
            placeholder="a highly sanitizing gallon of hand sanitizer"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setItemDescription(e.target.value)}
          />
        </div>
        {/* Tags */}
        <div>
          <Label htmlFor="tags-input">tags (optional)</Label>
          <p className="text-sm opacity-80">
            enter a comma-separated list of tags
          </p>
          <Input
            className="mt-1"
            id="tags-input"
            placeholder="cleaning, health, sanitation"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setItemTags(e.target.value)}
          />
        </div>
        {/* Self-pickup */}
        <div>
          <Label>can self-pickup? (optional)</Label>
          <div className="mt-1 flex items-start gap-2">
            <Checkbox
              className="mt-0.5"
              id="self-pickup-input"
              onCheckedChange={(value: boolean) => setItemSelfPickup(value)}
            />
            <Label className="text-sm opacity-80" htmlFor="self-pickup-input">
              can users pick up this item without placing a bid? i.e. is this
              item in a public location (default: no)
            </Label>
          </div>
        </div>
      </div>

      {/* Submit button */}
      <Button
        className="flex w-full gap-2"
        variant="filled"
        onClick={submitListing}
        disabled={!readyToList || isSubmittingItem}
      >
        <Loader2
          className={cn(
            isSubmittingItem ? 'block' : 'hidden',
            'h-4 animate-spin',
          )}
        />
        list item
      </Button>
    </div>
  );
}
