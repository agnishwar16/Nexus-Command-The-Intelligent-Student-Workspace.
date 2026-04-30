import NebulaDashboard from '@/components/nebula/NebulaDashboard';

export const metadata = {
  title: 'The Codex Nebula | Student Coding Dashboard',
  description: 'A living cosmic organism that breathes with your progress.',
};

export default function NebulaPage() {
  return (
    <main style={{ backgroundColor: '#020008', minHeight: '100vh' }}>
      <NebulaDashboard />
    </main>
  );
}
