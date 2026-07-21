import type { Metadata } from 'next';
import { Nav } from '@/components/sections/Nav';
import { RegisterForm } from '@/components/sections/RegisterForm';
import { Footer } from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'Register — flowbot',
};

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen">
      <Nav />
      <main className="content-layer flex flex-col items-center justify-center px-6 pt-32 pb-24">
        <span className="font-body text-xs uppercase tracking-[0.3em] text-iris-cyan/80">
          Register
        </span>
        <h1 className="mb-10 mt-4 font-display text-3xl font-light">Create an account.</h1>
        <RegisterForm />
      </main>
      <Footer />
    </div>
  );
}
