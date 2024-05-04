import Counter from '../components/experimental/Counter';
import { Section } from '../components/section/Section';

export default function Home() {
  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory">
      <Counter />
    </main>
  );
}
