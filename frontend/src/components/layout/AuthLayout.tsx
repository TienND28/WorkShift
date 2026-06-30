import type { ReactNode } from "react";



interface AuthLayoutProps {

  children: ReactNode;

}



export function AuthLayout({ children }: AuthLayoutProps) {

  return (

    <div className="min-h-dvh bg-white text-neutral-900 flex flex-col">

      <header className="flex items-center justify-center py-6 border-b border-neutral-200 bg-white">

        <span className="text-xl font-bold tracking-tight text-neutral-900">WorkShift</span>

      </header>



      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {children}

      </main>



      <footer className="py-8 text-center text-xs text-neutral-500">

        © {new Date().getFullYear()} WorkShift · Việt Nam

      </footer>

    </div>

  );

}

