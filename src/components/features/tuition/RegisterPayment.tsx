import React, { useState } from 'react';
import { 
  XMarkIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  totalFees: number;
  paid: number;
}

interface RegisterPaymentProps {
  student: Student;
  onClose: () => void;
  onSubmit: (payment: PaymentData) => void;
}

interface PaymentData {
  amount: number;
  method: 'cash' | 'mobile_money' | 'bank_transfer';
  date: string;
  notes: string;
}

const paymentMethods: { id: 'cash' | 'mobile_money' | 'bank_transfer'; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'cash', label: 'EspÃ¨ces', icon: BanknotesIcon },
  { id: 'mobile_money', label: 'Mobile Money', icon: DevicePhoneMobileIcon },
  { id: 'bank_transfer', label: 'Virement bancaire', icon: BuildingLibraryIcon },
];

export const RegisterPayment: React.FC<RegisterPaymentProps> = ({ student, onClose, onSubmit }) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: student.totalFees - student.paid,
    method: 'cash',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const remainingAmount = student.totalFees - student.paid;
  const maxAmount = remainingAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentData.amount > 0 && paymentData.date) {
      onSubmit(paymentData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Paiement</h2>
              <p className="text-xs text-gray-400">{student.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-sm font-bold text-gray-900">{student.totalFees.toLocaleString()} CFA</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">PayÃ©</p>
                <p className="text-sm font-bold text-green-600">{student.paid.toLocaleString()} CFA</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Reste</p>
                <p className="text-sm font-bold text-[#1067a8]">{maxAmount.toLocaleString()} CFA</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Montant</label>
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8]"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={paymentData.date}
                onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Montant rapide</label>
            <div className="flex gap-2">
              {[
                { label: 'Complet', value: maxAmount },
                { label: '50%', value: Math.round(maxAmount * 0.5) },
                { label: '25%', value: Math.round(maxAmount * 0.25) },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setPaymentData({ ...paymentData, amount: preset.value })}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    paymentData.amount === preset.value
                      ? 'bg-[#1067a8] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Mode de paiement</label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentData({ ...paymentData, method: method.id as PaymentData['method'] })}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    paymentData.method === method.id
                      ? 'border-[#1067a8] bg-[#1067a8]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <method.icon className="w-5 h-5 mx-auto text-gray-600" />
                    <p className="text-xs font-medium text-gray-700 mt-0.5">{method.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">Notes</label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8]"
              rows={2}
              placeholder="Notes..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-[#1067a8] text-white rounded-lg text-sm font-medium hover:bg-[#1067a8]/90 flex items-center justify-center gap-1"
            >
              <CheckCircleIcon className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
