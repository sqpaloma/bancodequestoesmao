import { TestesPreviosClient } from './_components/testes-previos-client';

export default function TestesPreviosPage() {
  // Handle authentication at the server level

  // Only render the client component for authenticated users
  return <TestesPreviosClient />;
}
