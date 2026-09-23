import { Link } from 'react-router-dom';
import { Button, Container } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="text-6xl">🍪</span>
      <h1 className="mt-6 text-4xl text-leaf-900">Página não encontrada</h1>
      <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-leaf-500">
        Essa página saiu do forno antes da hora. Volte ao cardápio para escolher seus brownies.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/" variant="primary">
          Ir para a página inicial
        </Button>
        <Button as={Link} to="/cardapio" variant="outline">
          Ver o cardápio
        </Button>
      </div>
    </Container>
  );
}
