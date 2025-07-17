import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [registrationData, setRegistrationData] = useState<RegisterFormData | null>(null);
  const [otpExpires, setOtpExpires] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
    reset: resetOTP,
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      
      if (response.data.success) {
        setRegistrationData(data);
        setOtpExpires(response.data.data.otpExpires);
        setStep('otp');
        toast.success('OTP sent to your email!');
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPFormData) => {
    if (!registrationData) return;
    
    setIsLoading(true);
    try {
      const response = await authApi.verifyOTP({
        email: registrationData.email,
        otp: data.otp,
        password: registrationData.password,
        businessName: registrationData.businessName,
      });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Registration completed successfully!');
        navigate('/dashboard');
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!registrationData) return;
    
    setIsLoading(true);
    try {
      const response = await authApi.sendOTP({ email: registrationData.email });
      
      if (response.data.success) {
        setOtpExpires(response.data.data.otpExpires);
        toast.success('OTP resent to your email!');
        resetOTP();
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setStep('register');
    setRegistrationData(null);
    setOtpExpires('');
    resetOTP();
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pattern py-12 px-4 sm:px-6 lg:px-8">
        <div className="form-container fade-in">
          <div className="card-gradient">
            <div className="page-header">
              <div className="icon-container bounce-in">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="page-title">
                Verify your email
              </h2>
              <p className="page-subtitle">
                We've sent a 6-digit code to{' '}
                <span className="font-semibold text-blue-600">{registrationData?.email}</span>
              </p>
            </div>

            <form className="space-y-8" onSubmit={handleOTPSubmit(onOTPSubmit)}>
              <div className="form-group">
                <label htmlFor="otp" className="form-label text-center block">
                  Enter OTP Code
                </label>
                <input
                  {...registerOTP('otp')}
                  type="text"
                  maxLength={6}
                  className={`otp-input ${
                    otpErrors.otp ? 'border-red-300 focus:ring-red-500' : ''
                  }`}
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
                {otpErrors.otp && (
                  <p className="form-error text-center">{otpErrors.otp.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Email</span>
                  )}
                </button>

                <div className="flex justify-between items-center pt-4">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to registration</span>
                  </button>

                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={isLoading}
                    className="nav-link disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            </form>

            {otpExpires && (
              <div className="status-info mt-6">
                <p className="text-center text-sm">
                  ⏰ OTP expires at {new Date(otpExpires).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pattern py-12 px-4 sm:px-6 lg:px-8">
      <div className="form-container slide-up">
        <div className="card-gradient">
          <div className="page-header">
            <div className="icon-container floating">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="page-title">
              Create your account
            </h2>
            <p className="page-subtitle">
              Or{' '}
              <Link
                to="/login"
                className="nav-link"
              >
                sign in to existing account
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="businessName" className="form-label">
                  Business Name
                </label>
                <input
                  {...register('businessName')}
                  type="text"
                  autoComplete="organization"
                  className={`input ${errors.businessName ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your business name"
                />
                {errors.businessName && (
                  <p className="form-error">{errors.businessName.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`input ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`input pr-12 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Password must contain at least one uppercase letter, one lowercase letter, and one number.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Create account</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
