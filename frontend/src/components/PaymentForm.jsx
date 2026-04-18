import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
  Heart,
  Lock,
  Loader,
  CheckCircle,
  AlertCircle,
  Zap,
  Calendar
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const donationUrl = `${API_URL}/api/donations`;

/**
 * PaymentForm Component
 * Collects donor information and payment details for donations
 */
const PaymentForm = ({ campaignId, campaignTitle, onDonationSuccess }) => {
  const [step, setStep] = useState(1); // 1: donor info, 2: amount/method, 3: review
  const [loading, setLoading] = useState(false);
  const [donationComplete, setDonationComplete] = useState(false);

  // Form states
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    isAnonymous: false,
    message: ''
  });

  const [donationDetails, setDonationDetails] = useState({
    amount: '',
    currency: 'USD',
    paymentMethod: 'stripe',
    isRecurring: false,
    recurringFrequency: 'monthly'
  });

  const recurringOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' }
  ];

  const handleDonorInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonorInfo({
      ...donorInfo,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDonationDetailsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonationDetails({
      ...donationDetails,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateStep1 = () => {
    if (!donorInfo.name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!donorInfo.email.trim()) {
      toast.error('Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorInfo.email)) {
      toast.error('Please enter a valid email');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!donationDetails.amount || isNaN(donationDetails.amount)) {
      toast.error('Please enter a valid donation amount');
      return false;
    }
    if (parseFloat(donationDetails.amount) < 1) {
      toast.error('Minimum donation amount is $1');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Create donation intent
      const response = await axios.post(`${donationUrl}/donate`, {
        campaignId,
        amount: parseFloat(donationDetails.amount),
        email: donorInfo.email,
        name: donorInfo.name,
        isAnonymous: donorInfo.isAnonymous,
        message: donorInfo.message,
        paymentMethod: donationDetails.paymentMethod,
        metadata: {
          phone: donorInfo.phone,
          company: donorInfo.company,
          isRecurring: donationDetails.isRecurring,
          recurringFrequency: donationDetails.recurringFrequency
        }
      });

      if (response.data.success) {
        setDonationComplete(true);
        toast.success('Thank you for your generous donation!');

        // Call success callback after 2 seconds
        setTimeout(() => {
          if (onDonationSuccess) {
            onDonationSuccess(response.data.donationId);
          }
          // Reset form
          resetForm();
        }, 2000);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process donation';
      toast.error(message);
      console.error('Donation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setDonorInfo({
      name: '',
      email: '',
      phone: '',
      company: '',
      isAnonymous: false,
      message: ''
    });
    setDonationDetails({
      amount: '',
      currency: 'USD',
      paymentMethod: 'stripe',
      isRecurring: false,
      recurringFrequency: 'monthly'
    });
    setDonationComplete(false);
  };

  if (donationComplete) {
    return (
      <>
        <ToastContainer position="top-center" autoClose={3000} />
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your donation of <span className="font-bold">${parseFloat(donationDetails.amount).toLocaleString()}</span> has been received.
              A confirmation has been sent to <span className="font-semibold">{donorInfo.email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You have been added to our list of donors and will receive updates about this campaign.
            </p>
            <button
              onClick={resetForm}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Make Another Donation
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 fill-current" />
              <h2 className="text-2xl font-bold">Make a Donation</h2>
            </div>
            <p className="text-blue-100 text-sm">{campaignTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <div
                  className={`flex-1 h-2 mx-1 rounded transition-colors ${
                    step >= 1 ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                ></div>
                <div
                  className={`flex-1 h-2 mx-1 rounded transition-colors ${
                    step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                ></div>
                <div
                  className={`flex-1 h-2 mx-1 rounded transition-colors ${
                    step >= 3 ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Step {step} of 3
              </p>
            </div>

            {/* Step 1: Donor Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={donorInfo.name}
                    onChange={handleDonorInfoChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={donorInfo.email}
                    onChange={handleDonorInfoChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={donorInfo.phone}
                    onChange={handleDonorInfoChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={donorInfo.company}
                    onChange={handleDonorInfoChange}
                    placeholder="Acme Inc."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAnonymous"
                      checked={donorInfo.isAnonymous}
                      onChange={handleDonorInfoChange}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Keep my donation anonymous
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={donorInfo.message}
                    onChange={handleDonorInfoChange}
                    placeholder="Share why you're supporting this cause..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Step 2: Amount & Payment Method */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Donation Amount
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="currency"
                      value={donationDetails.currency}
                      onChange={handleDonationDetailsChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <input
                      type="number"
                      name="amount"
                      value={donationDetails.amount}
                      onChange={handleDonationDetailsChange}
                      placeholder="Enter amount"
                      min="1"
                      step="0.01"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Or choose a preset amount:
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 100, 250].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() =>
                          setDonationDetails({ ...donationDetails, amount: amt })
                        }
                        className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                          parseInt(donationDetails.amount) === amt
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recurring Donation */}
                <div className="border-t pt-4">
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={donationDetails.isRecurring}
                      onChange={handleDonationDetailsChange}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Make this a recurring donation
                      </span>
                      <p className="text-xs text-gray-500">
                        We'll charge you on the same day each period
                      </p>
                    </div>
                  </label>

                  {donationDetails.isRecurring && (
                    <select
                      name="recurringFrequency"
                      value={donationDetails.recurringFrequency}
                      onChange={handleDonationDetailsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {recurringOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Payment Method */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </p>
                  <div className="space-y-2">
                    {[
                      { value: 'stripe', label: '💳 Credit/Debit Card (Stripe)' },
                      { value: 'paypal', label: '🅿️ PayPal' },
                      { value: 'bank_transfer', label: '🏦 Bank Transfer' }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={donationDetails.paymentMethod === method.value}
                          onChange={handleDonationDetailsChange}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Review Your Donation
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Donor Name:</span>
                    <span className="font-semibold text-gray-900">
                      {donorInfo.isAnonymous ? 'Anonymous' : donorInfo.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">
                      {donorInfo.email}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-gray-600">Donation Amount:</span>
                    <span className="text-xl font-bold text-blue-600">
                      {donationDetails.currency}{parseFloat(donationDetails.amount).toLocaleString()}
                    </span>
                  </div>
                  {donationDetails.isRecurring && (
                    <div className="flex justify-between text-orange-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Recurring:
                      </span>
                      <span className="font-semibold">
                        {donationDetails.recurringFrequency.charAt(0).toUpperCase() +
                          donationDetails.recurringFrequency.slice(1)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-gray-900">
                      {donationDetails.paymentMethod === 'stripe'
                        ? 'Credit Card'
                        : donationDetails.paymentMethod.charAt(0).toUpperCase() +
                          donationDetails.paymentMethod.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Your donation is secure and encrypted. We never store your payment details.
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs text-gray-600">
                    I agree to the donation terms and privacy policy
                  </span>
                </label>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Complete Donation
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PaymentForm;
