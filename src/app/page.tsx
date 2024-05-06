import { General } from '../components/general/General';
import { Projects } from '../components/projects/Projects';

export default function Home() {
  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory">
      <General />

      <Projects />
    </main>
  );
}
