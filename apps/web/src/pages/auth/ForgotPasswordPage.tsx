import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Check your email for reset instructions');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to send reset email');
      }
    } catch {
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="card-retro">
        <div className="text-center">
          <h2 className="font-display text-4xl text-retro-navy tracking-wider mb-4">
            CHECK YOUR EMAIL
          </h2>
          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to <strong>{email}</strong>
          </p>
          <Link to="/auth/login" className="text-retro-red font-bold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-retro">
      <div className="text-center mb-8">
        <h2 className="font-display text-4xl text-retro-navy tracking-wider">
          RESET PASSWORD
        </h2>
        <p className="text-gray-600 mt-2">Enter your email to receive reset instructions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-heading uppercase text-sm mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="input-retro"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-retro-primary disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/auth/login" className="text-retro-red font-bold hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
