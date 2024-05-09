import { General } from '../components/general/General';
import { SoftwareEngineering } from '../components/software-engineering/SoftwareEngineering';

export default function Home() {
  return (
    <main className="h-screen snap-y snap-mandatory overflow-y-scroll">
      <General />

      {/* <SoftwareEngineering /> */}
    </main>
  );
}
