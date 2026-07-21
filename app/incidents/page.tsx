import type { Metadata } from 'next';
import { Nav } from '@/components/sections/Nav';
import { EngineeringLog } from '@/components/sections/EngineeringLog';
import { Footer } from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'Incidents — flowbot',
  description:
    'A running log of real failures in the system, and the rule that shipped because of each one.',
};

export default function IncidentsPage() {
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer pt-24">
        <EngineeringLog />
      </main>
      <Footer />
    </div>
  );
}
