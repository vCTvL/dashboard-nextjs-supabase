import AuthForm from "@/components/auth/AuthForm";
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'




export default function Home() {
  return (
    <div className="pt-12">
      <AuthForm type="sign-in" />
    </div>
  );
}
