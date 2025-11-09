'use client';

import { FilePlusIcon, FolderCogIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/admin/criar-questao',
    label: 'Criar Questão',
    icon: FilePlusIcon,
  },
  {
    href: '/admin/gerenciar-questoes',
    label: 'Gerenciar Questões',
    icon: FolderCogIcon,
  },
  {
    href: '/admin/gerenciar-temas',
    label: 'Gerenciar Temas',
    icon: FolderCogIcon,
  },
];

export function AdminNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn('bg-card rounded-lg border p-1', className)}>
      <ul className="flex items-center justify-center gap-1">
        {navItems.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <item.icon size={13} />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
