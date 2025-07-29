'use client';
export default function LoginPage() {
  const loginWithNYCU = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <button onClick={loginWithNYCU}>
      Log in with NYCU
    </button>
  );
}