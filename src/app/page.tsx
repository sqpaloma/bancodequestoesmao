import { SignInButton } from '@clerk/nextjs';
import { ArrowRight, BookOpen, Brain, Target, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Banco de Questões
            <span className="mt-2 block bg-gradient-to-r from-brand-blue to-blue-600 bg-clip-text text-transparent">
              MÃO
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
            Plataforma completa de questões para estudantes e profissionais de
            ortopedia. Estude de forma inteligente e alcance seus objetivos.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <SignInButton mode="redirect" forceRedirectUrl="/admin">
              <button className="group flex items-center gap-2 rounded-lg bg-brand-blue px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-600 hover:shadow-xl">
                Começar Agora
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Recursos que fazem a diferença
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Tudo que você precisa para uma preparação completa
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={BookOpen}
            title="Banco Extenso"
            description="Milhares de questões cuidadosamente selecionadas e atualizadas"
            color="bg-blue-500"
          />
          <FeatureCard
            icon={Brain}
            title="Modos de Estudo"
            description="Escolha entre modo estudo ou simulado para otimizar seu aprendizado"
            color="bg-indigo-500"
          />
          <FeatureCard
            icon={Target}
            title="Filtros Avançados"
            description="Organize por temas, subtemas e grupos para um estudo direcionado"
            color="bg-cyan-500"
          />
          <FeatureCard
            icon={Users}
            title="Acompanhamento"
            description="Monitore seu progresso e identifique pontos de melhoria"
            color="bg-blue-600"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-brand-blue to-blue-600 px-6 py-16 shadow-xl sm:px-12 lg:px-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pronto para começar?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Junte-se a milhares de estudantes que já estão se preparando com
              o OrtoQBank
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SignInButton mode="redirect" forceRedirectUrl="/admin">
                <button className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-brand-blue shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl">
                  Acessar Plataforma
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} OrtoQBank - Banco de Questões MÃO.
            Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
      <div className="flex flex-col items-center text-center">
        <div className={`${color} rounded-lg p-3 text-white`}>
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-xl font-semibold text-gray-900">{title}</h3>
        <p className="mt-3 text-gray-600">{description}</p>
      </div>
    </div>
  );
}
