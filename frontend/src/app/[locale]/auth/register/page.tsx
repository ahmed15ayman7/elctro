import Navbar from "@/components/layout/Navbar";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-8">
        <RegisterForm />
      </main>
    </div>
  );
}
