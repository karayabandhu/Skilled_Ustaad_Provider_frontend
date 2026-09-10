import React, { useState } from 'react';
import { X, Plus, Trash2, CreditCard, Landmark, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { addEarningsPaymentMethod, deleteEarningsPaymentMethod } from '../../services/api';
import { toast } from 'sonner';
import { getFriendlyErrorMessage } from '../../utils/errors';

const MAX_PAYMENT_METHODS = 5;

// Validation rules
const VALIDATORS = {
  name: {
    regex: /^[a-zA-Z\s]+$/,
    message: 'Only letters and spaces are allowed.',
    maxLen: 60,
  },
  accountNumber: {
    regex: /^\d+$/,
    message: 'Only digits are allowed.',
    maxLen: 18,
  },
  ifscCode: {
    regex: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    message: 'Must be 11 chars: 4 letters, 0, then 6 alphanumeric (e.g. SBIN0001234).',
    maxLen: 11,
  },
  upiId: {
    regex: /^[\w.\-]+@[\w]+$/,
    message: 'Enter a valid UPI ID (e.g. 9868xxx@ybl).',
    maxLen: 50,
  },
};

const ManagePaymentMethodsModal = ({ isOpen, onClose, paymentMethods, onUpdate }) => {
  const [newMethodType, setNewMethodType] = useState('Bank');
  const [newMethodName, setNewMethodName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newIfscCode, setNewIfscCode] = useState('');
  const [newUpiId, setNewUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  if (!isOpen) return null;

  const count = paymentMethods?.length || 0;
  const isAtLimit = count >= MAX_PAYMENT_METHODS;

  /* ---- Field-level validation ---- */
  const validate = (field, value) => {
    const v = VALIDATORS[field];
    if (!value) return 'This field is required.';
    if (v.maxLen && value.length > v.maxLen) return `Maximum ${v.maxLen} characters allowed.`;
    if (!v.regex.test(value)) return v.message;
    return '';
  };

  const handleNameChange = (e) => {
    // Strip disallowed characters in real time (digits & specials)
    const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setNewMethodName(clean);
    if (touched.name) setErrors(prev => ({ ...prev, name: validate('name', clean) }));
  };

  const handleAccountNumberChange = (e) => {
    // Strip non-digits in real time
    const clean = e.target.value.replace(/\D/g, '').slice(0, 18);
    setNewAccountNumber(clean);
    if (touched.accountNumber) setErrors(prev => ({ ...prev, accountNumber: validate('accountNumber', clean) }));
  };

  const handleIfscChange = (e) => {
    // Strip specials, force uppercase, max 11 chars
    const clean = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 11);
    setNewIfscCode(clean);
    if (touched.ifscCode) setErrors(prev => ({ ...prev, ifscCode: validate('ifscCode', clean) }));
  };

  const handleUpiChange = (e) => {
    const val = e.target.value.slice(0, 50);
    setNewUpiId(val);
    if (touched.upiId) setErrors(prev => ({ ...prev, upiId: validate('upiId', val) }));
  };

  const handleBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validate(field, value) }));
  };

  /* ---- Form submission ---- */
  const handleAddMethod = async () => {
    if (isAtLimit) {
      toast.error(`You can add a maximum of ${MAX_PAYMENT_METHODS} payment methods.`);
      return;
    }

    // Run all validations before submit
    const newErrors = { name: validate('name', newMethodName) };
    if (newMethodType === 'Bank') {
      newErrors.accountNumber = validate('accountNumber', newAccountNumber);
      newErrors.ifscCode = validate('ifscCode', newIfscCode);
    } else {
      newErrors.upiId = validate('upiId', newUpiId);
    }

    const hasErrors = Object.values(newErrors).some(e => e);
    setErrors(newErrors);
    setTouched({ name: true, accountNumber: true, ifscCode: true, upiId: true });

    if (hasErrors) return;

    setLoading(true);
    try {
      const details = JSON.stringify({
        accountNumber: newAccountNumber,
        ifscCode: newIfscCode,
        upiId: newUpiId,
      });

      await addEarningsPaymentMethod({ type: newMethodType, name: newMethodName, details });

      // Reset form
      setNewMethodName('');
      setNewAccountNumber('');
      setNewIfscCode('');
      setNewUpiId('');
      setErrors({});
      setTouched({});
      onUpdate();
      toast.success('Payment method added successfully.');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Unable to add new payment method. Please check your information.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMethod = async (id) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) return;
    setLoading(true);
    try {
      await deleteEarningsPaymentMethod(id);
      onUpdate();
      toast.success('Payment method removed.');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Failed to remove the payment method. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ field }) =>
    errors[field] && touched[field] ? (
      <p className="flex items-center gap-1 text-[11px] text-red-500 font-medium mt-1">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-50 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold dark:text-white">Payment Methods</h3>
            <p className="text-xs text-gray-400 mt-0.5">{count} of {MAX_PAYMENT_METHODS} methods added</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Active methods list */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Methods</p>
            {paymentMethods?.length > 0 ? (
              paymentMethods.map(method => (
                <div key={method._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      {method.type === 'Bank'
                        ? <Landmark className="w-5 h-5 text-blue-600" />
                        : <CreditCard className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold dark:text-white">{method.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {(() => {
                          try {
                            const d = JSON.parse(method.details);
                            return method.type === 'Bank'
                              ? `${d.accountNumber} (${d.ifscCode})`
                              : d.upiId;
                          } catch {
                            return method.details;
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMethod(method._id)}
                    disabled={loading}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No payment methods added yet.</p>
            )}
          </div>

          {/* Add new method form */}
          <div className="pt-6 border-t border-gray-50 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Add New Method</p>
              {isAtLimit && (
                <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                  Limit reached ({MAX_PAYMENT_METHODS} max)
                </span>
              )}
            </div>

            {isAtLimit ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>You've reached the maximum of {MAX_PAYMENT_METHODS} payment methods. Remove one to add a new one.</span>
              </div>
            ) : (
              <>
                {/* Method type selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setNewMethodType('Bank'); setErrors({}); setTouched({}); }}
                    className={`py-2 px-4 rounded-xl text-sm font-bold border-2 transition-all ${newMethodType === 'Bank' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 dark:border-gray-700 text-gray-500'}`}
                  >
                    Bank Transfer
                  </button>
                  <button
                    onClick={() => { setNewMethodType('UPI'); setErrors({}); setTouched({}); }}
                    className={`py-2 px-4 rounded-xl text-sm font-bold border-2 transition-all ${newMethodType === 'UPI' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 dark:border-gray-700 text-gray-500'}`}
                  >
                    UPI / Wallet
                  </button>
                </div>

                {/* Account Holder Name */}
                <div>
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    className={`w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.name && touched.name ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'}`}
                    value={newMethodName}
                    onChange={handleNameChange}
                    onBlur={() => handleBlur('name', newMethodName)}
                    maxLength={60}
                  />
                  <FieldError field="name" />
                </div>

                {newMethodType === 'Bank' ? (
                  <div className="space-y-3">
                    {/* Account Number */}
                    <div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="A/C Number (digits only)"
                        className={`w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.accountNumber && touched.accountNumber ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'}`}
                        value={newAccountNumber}
                        onChange={handleAccountNumberChange}
                        onBlur={() => handleBlur('accountNumber', newAccountNumber)}
                        maxLength={18}
                      />
                      <FieldError field="accountNumber" />
                    </div>

                    {/* IFSC Code */}
                    <div>
                      <input
                        type="text"
                        placeholder="IFSC Code (e.g. SBIN0001234)"
                        className={`w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none uppercase transition-colors ${errors.ifscCode && touched.ifscCode ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'}`}
                        value={newIfscCode}
                        onChange={handleIfscChange}
                        onBlur={() => handleBlur('ifscCode', newIfscCode)}
                        maxLength={11}
                      />
                      <FieldError field="ifscCode" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="UPI ID (e.g. 9868xxx@ybl)"
                      className={`w-full p-3 bg-gray-50 dark:bg-gray-700 border rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${errors.upiId && touched.upiId ? 'border-red-400' : 'border-gray-100 dark:border-gray-700'}`}
                      value={newUpiId}
                      onChange={handleUpiChange}
                      onBlur={() => handleBlur('upiId', newUpiId)}
                      maxLength={50}
                    />
                    <FieldError field="upiId" />
                  </div>
                )}

                <Button
                  className="w-full rounded-xl py-6"
                  onClick={handleAddMethod}
                  disabled={loading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePaymentMethodsModal;
