
"use client";

import {
  Building2,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  Users,
  Plus,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const amenities = [
  "Wi-Fi",
  "Air Conditioning",
  "Soundproofing",
  "Parking",
  "Lighting Equipment",
  "Professional Cameras",
  "Green Screen",
  "Kitchen",
  "Restroom",
  "24/7 Access",
];

const AddStudioPage = () => {
	const {data:session}=authClient.useSession()
	const user=session?.user
	const handleSubmit=async(e)=>{
e.preventDefault()
const formData=new FormData(e.currentTarget)
const data=Object.fromEntries(formData.entries())
console.log(data)

const res=await fetch(`http://localhost:8000/addStudio`,{
method:"POST",
headers:{
	'Content-Type':"application/json"
},
body:JSON.stringify(data)


}


)
const dataJson=await res.json()
console.log(dataJson)

	}
  return (
    <div className="min-h-screen bg-background px-4 py-12">

      {/* Centered Container */}
      <div className="mx-auto w-full max-w-4xl">

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 shadow-sm sm:p-10">

          {/* Header */}
          <div className="mb-10">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 size={28} />
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              List Your Studio
            </h1>

            <p className="mt-3 text-sm text-muted-foreground">
              Share your creative space with professionals and creators.
              Fill in the details below to publish your studio listing.
            </p>
          </div>

          <div className="space-y-7">

            {/* Studio Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Studio Title <span className="text-red-500">*</span>
              </label>

              <Input
                name="title"
                placeholder="e.g. Modern Photography Studio"
                className="h-11"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Studio Category <span className="text-red-500">*</span>
              </label>

              <Select>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose studio category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="photo-studio">
                    Photo Studio
                  </SelectItem>
                  <SelectItem value="film-stage">
                    Film Stage
                  </SelectItem>
                  <SelectItem value="podcast-lounge">
                    Podcast Lounge
                  </SelectItem>
                  <SelectItem value="music-suite">
                    Music Suite
                  </SelectItem>
                  <SelectItem value="workshop">
                    Workshop
                  </SelectItem>
                  <SelectItem value="other">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pricing and Capacity */}
            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Hourly Rate ($) <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    name="hourlyRate"
                    type="number"
                    placeholder="50"
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Security Deposit ($)
                </label>

                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    name="securityDeposit"
                    type="number"
                    placeholder="100"
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Maximum Capacity <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    name="maxCapacity"
                    type="number"
                    placeholder="e.g. 20 people"
                    className="h-11 pl-10"
                  />
                </div>
              </div>

            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Location / Address <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                <Input
                  name="location"
                  placeholder="Enter complete studio address"
                  className="h-11 pl-10"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Studio Image URL <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

                <Input
                  name="image"
                  placeholder="https://example.com/studio-image.jpg"
                  className="h-11 pl-10"
                />
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Provide a direct image URL of your studio.
              </p>
            </div>

            {/* Amenities */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Studio Amenities
              </label>

              <p className="mb-4 text-sm text-muted-foreground">
                Select all facilities available in your studio.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                {amenities.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      name="amenities"
                      value={amenity}
                      className="h-4 w-4 accent-primary"
                    />

                    <span>{amenity}</span>
                  </label>
                ))}

              </div>
            </div>

            {/* Detailed Overview */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Detailed Overview <span className="text-red-500">*</span>
              </label>

              <Textarea
                name="overview"
                placeholder="Describe your studio, facilities, equipment, atmosphere and what makes it special..."
                className="min-h-40 resize-none"
              />

              <p className="mt-2 text-xs text-muted-foreground">
                Give potential customers a clear idea of your creative space.
              </p>
            </div>

            {/* Owner Information */}
            <div className="border-t pt-7">

              <h2 className="mb-5 text-lg font-semibold">
                Owner Information
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Owner Name
                  </label>

                  <Input
                    name="ownerName"
                    value={user.name}
                    readOnly
                    className="h-11 bg-muted"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Owner Email
                  </label>

                  <Input
                    name="ownerEmail"
                    value={user.email}
                    readOnly
                    className="h-11 bg-muted"
                  />
                </div>

              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                Your account information will be associated with this listing.
              </p>

            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t pt-7 sm:flex-row sm:justify-end">

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="sm:min-w-32"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                size="lg"
                className="gap-2 sm:min-w-48"
              >
                <Plus size={18} />
                Publish Studio
              </Button>

            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default AddStudioPage;
