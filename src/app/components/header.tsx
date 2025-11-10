import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <nav>
    <header className="sticky top-0 z-50 bg-brand-blue text-white">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-end space-x-2">
          <Image
            src="/logo-transparente.png"
            alt="OrtoQBank Logo"
            width={25}
            height={25}
            className="rounded-sm"
          />
          <span className="font-sifonn translate-y-1 text-xl font-bold">
            OrtoQBank
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/admin/criar-questao">Criar Questões</Link> 
          <Link href="/admin/gerenciar-questoes">Gerenciar Questões</Link>
          <Link href="/admin/gerenciar-temas">Gerenciar Temas</Link>
        </div>
      </div>
    </header>
    </nav>
  );
}
