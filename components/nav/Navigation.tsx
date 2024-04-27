'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
function Navigation() {
  return (
    <nav className="fixed inset-0  z-[100] h-16 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="relative h-full w-full">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="logo"
            width={140}
            height={140}
            className="absolute left-4 top-[50%] translate-y-[-50%]"
          />
        </Link>
      </div>
    </nav>
  );
}
export default Navigation;
