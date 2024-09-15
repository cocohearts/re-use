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
          <Label htmlFor="tags-input">tags</Label>
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
        <div>
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
        </div>
      </div>

      {/* Submit button */}
      <Button className="w-full" variant="filled">
        list item
      </Button>
    </div>
  );
}
