import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";

const Auth = () => {
  return (
    <div className="min-h-screen bg-[#008080] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Logo />
          <h2 className="mt-6 text-3xl font-bold text-white">
            Welcome to Oddogo
          </h2>
          <p className="mt-2 text-white/80">
            Sign in to manage your charity fingerprint
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-xl">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth;
