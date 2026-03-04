'use client';

import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  lang?: string;
}

export function BackButton({ href, lang }: BackButtonProps) {
  if (!href) {
    return null;
  }

  const finalHref = lang ? `/${lang}${href}` : href;

  return (
    <Link href={finalHref} className="-ml-2 mb-2 inline-block">
      <Button variant="ghost" size="sm">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back
      </Button>
    </Link>
  );
}
