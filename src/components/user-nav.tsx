"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function UserNav() {
  const userAvatar = PlaceHolderImages.find((p) => p.id === "user-avatar");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={userAvatar?.imageUrl}
              alt="@operator"
              data-ai-hint={userAvatar?.imageHint}
            />
            <AvatarFallback>OP</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem>Çıkış Yap</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
