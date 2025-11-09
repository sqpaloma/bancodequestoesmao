import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-brand-blue text-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-end space-x-2">
          <Image
            src="/logo-transparente.png"
            alt="OrtoQBank Logo"
            width={40}
            height={40}
            className="rounded-sm"
          />
          <span className="font-sifonn translate-y-1 text-2xl font-bold">
            OrtoQBank
          </span>
        </Link>
      </div>
    </header>
  );
}
