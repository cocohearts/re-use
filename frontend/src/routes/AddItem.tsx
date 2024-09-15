import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

export default function AddItemPage() {
  return (
    <div className="text-pine-900">
      <h1 className="text-3xl">list a free item</h1>

      {/* Photos */}
      <div className="mb-4 flex flex-col">
        <span className="mb-4">photos &bull; 1/10</span>
        <div className="flex h-40 gap-4">
          {/* All the photos in an array */}
          <Button className="flex h-full w-40 flex-col gap-1" variant="default">
            <Plus />
            <span>add photo</span>
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="mb-8 flex flex-col gap-3">
        {/* Name */}
        <div>
          <label htmlFor="name-input">item name</label>
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
          <label htmlFor="quality-input">quality</label>
          <Select>
            <SelectTrigger className="mt-1 w-full [&>span]:opacity-50">
              <SelectValue placeholder="quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">new</SelectItem>
              <SelectItem value="like new">like new</SelectItem>
              <SelectItem value="good">good</SelectItem>
              <SelectItem value="bad">bad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit button */}
      <Button className="w-full" variant="filled">
        put up item
      </Button>
    </div>
  );
}
