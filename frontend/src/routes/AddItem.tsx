import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function AddItemPage() {
  const photoUploadRef: any = useRef(null);
  const [photos, setPhotos] = useState<{ src: string; id: string }[]>([]);

  const onPhotoUpload = (e: any) => {
    const { files }: { files: File[] } = e.target;
    if (files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e || !e.target) return;
        const id = uuidv4();
        setPhotos((photos) => [
          ...photos,
          { src: e.target?.result as string, id },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    setPhotos((photos) => photos.filter((photo) => photo.id !== id));
  };

  return (
    <div className="text-pine-900">
      <h1 className="mb-4 text-3xl">list an item</h1>

      {/* Photos */}
      <span className="">photos &bull; {photos.length}/10</span>
      <div className="mb-4 mt-1.5 flex flex-col overflow-x-auto">
        <div className="flex h-40 gap-4">
          {/* All the photos in an array */}
          {photos.map((photo) => {
            return (
              <div
                className="relative h-full w-40 shrink-0 overflow-hidden rounded-md"
                key={photo.id}
              >
                <button
                  className="absolute right-2 top-2 rounded-full bg-neutral-900/30"
                  onClick={() => removePhoto(photo.id)}
                >
                  <X className="stroke-white p-0.5" />
                </button>
                <img className="h-full object-cover" src={photo.src} />
              </div>
            );
          })}
          <Button
            className="flex h-full w-40 shrink-0 flex-col gap-1"
            variant="default"
            onClick={() => photoUploadRef?.current?.click()}
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
          />
        </div>
        {/* Quality */}
        <div>
          <Label htmlFor="quality-input">quality</Label>
          <Select>
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
            placeholder="masseeh hall"
            autoComplete="off"
            spellCheck={false}
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
          />
        </div>
        {/* Tags */}
        <div>
          <Label htmlFor="tags-input">tags (optional)</Label>
          <p className="text-sm opacity-80">a comma-separated list of tags</p>
          <Input
            className="mt-1"
            id="tags-input"
            placeholder="cleaning, gallon, sanitation"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        {/* Self-pickup */}
        {/* <div>
          <Label htmlFor="self-pickup-input">self-pickup *</Label>
          <p className="text-sm opacity-80">
            can people pick up items without notifying you?
          </p>
          <RadioGroup className="mt-2" id="self-pickup-input">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yes" id="option-yes" />
              <Label htmlFor="option-yes">yes</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="no" id="option-no" />
              <Label htmlFor="option-no">no, i will choose the bidder</Label>
            </div>
          </RadioGroup>
        </div> */}
      </div>

      {/* Submit button */}
      <Button className="w-full" variant="filled">
        list item
      </Button>
    </div>
  );
}
