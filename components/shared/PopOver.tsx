'use client'

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { authClient } from "@/lib/auth-client";

import React from 'react';
import { Button } from "../ui/button";
import Image from "next/image";
import { User } from "lucide-react";
import Link from "next/link";

const PopOver = () => {
	const { data: session } = authClient.useSession();

const user=session?.user;
	return (
		<Popover>
 <PopoverTrigger
  render={
    <Button
      variant="outline"
      className="h-10 w-10 rounded-full overflow-hidden p-0"
    />
  }
>
  {user?.image ? (
    <Image
      src={user.image}
      alt="Profile"
      width={40}
      height={40}
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <User size={20} />
  )}
</PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>{user.email}</PopoverTitle>
      <PopoverDescription>{user.name}</PopoverDescription>
	  <Link href="/AddNewStudio">Add New Studio</Link>
	  <Button variant={"outline"} onClick={async()=>{await authClient.signOut();}}>Sign Out</Button>
    </PopoverHeader>
  </PopoverContent>
</Popover>
	);
};

export default PopOver;