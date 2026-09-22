'use client';

import { SlidersHorizontalIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Mobile: filters live in a bottom sheet. The FilterForm (server component) is passed as children.
export function FilterSheet({
  activeCount,
  children,
}: {
  activeCount: number;
  children: ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        <SlidersHorizontalIcon />
        Filters{activeCount > 0 ? ` (${activeCount})` : ''}
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the list. Tags are above the list.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
