'use client';

import { SignInButton } from '@clerk/nextjs';
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react';
import { List, PlusCircle, Tags } from 'lucide-react';
import Link from 'next/link';

const cards = [
  {
    title: 'Criar Questão',
    description: 'Adicione novas questões ao banco de dados',
    icon: PlusCircle,
    href: '/admin/criar-questao',
    color: 'bg-blue-500',
  },
  {
    title: 'Ver Questões',
    description: 'Visualize e gerencie todas as questões cadastradas',
    icon: List,
    href: '/admin/gerenciar-questoes',
    color: 'bg-green-500',
  },
  {
    title: 'Adicionar Temas',
    description: 'Gerencie temas, subtemas e grupos de questões',
    icon: Tags,
    href: '/admin/gerenciar-temas',
    color: 'bg-purple-500',
  },
];

export default function HomePage() {
  return (
    <main className="w-full bg-gradient-to-b from-slate-50 via-brand-blue/10 to-indigo-100 min-h-screen">
      <AuthLoading>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md px-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Banco de Questões MÃO
            </h1>
            <p className="text-gray-600 mb-8">
              Faça login para acessar o sistema de gerenciamento de questões
            </p>
            <SignInButton mode="modal">
              <button className="bg-brand-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                Entrar
              </button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="mx-auto max-w-5xl px-2 pb-20 pt-4 md:px-6 md:py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Banco de Questões MÃO
            </h1>

          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${card.color} rounded-lg p-3 text-white`}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-blue transition-colors">
                        {card.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-sm font-medium text-brand-blue">
                    Acessar
                    <svg
                      className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Authenticated>
    </main>
  );
}
