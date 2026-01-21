import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
      toast.success('Account created! Let\'s set up your shop.');
      navigate('/onboarding');
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="card-retro">
      <div className="text-center mb-8">
        <h2 className="font-display text-4xl text-retro-navy tracking-wider">
          GET STARTED
        </h2>
        <p className="text-gray-600 mt-2">Create your account in 30 seconds</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-retro-red text-retro-red">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-heading uppercase text-sm mb-2">
            Business Name *
          </label>
          <input
            type="text"
            className="input-retro"
            placeholder="Your Auto Repair Shop"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-heading uppercase text-sm mb-2">
              First Name
            </label>
            <input
              type="text"
              className="input-retro"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-heading uppercase text-sm mb-2">
              Last Name
            </label>
            <input
              type="text"
              className="input-retro"
              placeholder="Smith"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block font-heading uppercase text-sm mb-2">
            Email Address *
          </label>
          <input
            type="email"
            className="input-retro"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-heading uppercase text-sm mb-2">
            Password *
          </label>
          <input
            type="password"
            className="input-retro"
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            minLength={8}
            required
          />
        </div>

        <div>
          <label className="block font-heading uppercase text-sm mb-2">
            Confirm Password *
          </label>
          <input
            type="password"
            className="input-retro"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-retro-primary disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-retro-red font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
