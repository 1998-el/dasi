import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  ArrowLeftIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

interface ReceiptData {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  registrationFees: boolean;
  tuitionFees: boolean;
  tuitionPaymentMethod: 'full' | 'installment';
  paymentMethod: 'cash' | 'mobile_money';
  totalAmount: number;
  photo?: string;
  date: string;
}

// School information
const SCHOOL_INFO = {
  name: 'MAAT SCHOOL',
  tagline: 'Excellence en Formation',
  contact: '+237 6XX XX XX XX',
  address: 'Douala, Cameroun',
  openingNumber: '01/A/200/FS/2024',
};

export const Receipt: React.FC = () => {
  const location = useLocation();
  const receiptData = location.state as ReceiptData;
  const printRef = useRef<HTMLDivElement>(null);

  if (!receiptData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-400">Aucune donnÃ©es de reÃ§u disponibles</p>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mt-4"
          >
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };


  const totalFees = 65000;
  const installmentAmount = 32500;

  const getPaymentMethodLabel = (method: string) => {
    return method === 'cash' ? 'EspÃ¨ces' : 'Mobile Money';
  };

  const numberToWords = (num: number): string => {
    const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    
    if (num === 0) return 'zÃ©ro';
    
    let result = '';
    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      result += thousands === 1 ? 'mille ' : units[thousands] + ' mille ';
      num %= 1000;
    }
    if (num >= 100) {
      const hundreds = Math.floor(num / 100);
      result += hundreds === 1 ? 'cent ' : units[hundreds] + ' cents ';
      num %= 100;
    }
    if (num >= 20) {
      const tensIndex = Math.floor(num / 10);
      const unit = num % 10;
      if (tensIndex === 7 || tensIndex === 9) {
        result += teens[unit] + '-dix ';
        num = 0;
      } else {
        result += tens[tensIndex];
        if (unit === 1) result += ' et un';
        else if (unit > 0) result += '-' + units[unit];
        num = 0;
      }
    }
    if (num > 0) {
      result += num < 10 ? units[num] : teens[num - 10];
    }
    return result.trim();
  };

  const totalPaid = receiptData.totalAmount;
  const totalInWords = numberToWords(totalPaid);

  // Calculate remaining if tuition was selected
  const remainingAmount = receiptData.tuitionFees 
    ? (receiptData.tuitionPaymentMethod === 'full' ? 0 : installmentAmount)
    : totalFees;

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:max-w-none">
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={() => window.history.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/students'}
            className="flex items-center gap-2"
          >
            Retour aux Ã©tudiants
          </Button>
          <Button 
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <PrinterIcon className="w-4 h-4" />
            Imprimer
          </Button>
        </div>
      </div>

      <div ref={printRef} className="bg-white print:p-4">
        {/* Landscape Layout */}
        <div className="border-2 border-black print:border-black w-full max-w-[1000px] mx-auto">
          
          {/* HEADER */}
          <div className="flex border-b-2 border-black">
            {/* Left - Logo */}
            <div className="w-32 border-r-2 border-black p-4 flex items-center justify-center">
              <div className="w-20 h-20 bg-[#1067a8] rounded-full flex items-center justify-center print:bg-black">
                <span className="text-white font-bold text-3xl print:text-black print:bg-transparent print:rounded-none">M</span>
              </div>
            </div>
            
            {/* Center - School Info */}
            <div className="flex-1 p-4 text-center">
              <h1 className="text-xl font-bold text-[#1067a8] print:text-black uppercase tracking-wider">
                {SCHOOL_INFO.name}
              </h1>
              <p className="text-sm text-gray-600 print:text-black mt-1">{SCHOOL_INFO.tagline}</p>
              <p className="text-xs text-gray-500 print:text-gray-700 mt-2">
                Ouverture NÂ° {SCHOOL_INFO.openingNumber}
              </p>
            </div>
            
            {/* Right - Receipt Title */}
            <div className="w-40 border-l-2 border-black p-4 flex flex-col items-center justify-center">
              <h2 className="text-lg font-bold text-[#1067a8] print:text-black uppercase">
                ReÃ§u
              </h2>
              <p className="text-xs text-gray-400 print:text-gray-600 mt-1">NÂ° {receiptData.studentId}</p>
            </div>
          </div>

          {/* BODY */}
          <div className="flex">
            {/* Left Side - Student Info */}
            <div className="w-1/2 border-r-2 border-black p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">ReÃ§u de</p>
                  <p className="font-bold text-lg text-[#1067a8] print:text-black">
                    {receiptData.lastName} {receiptData.firstName}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">TÃ©lÃ©phone</p>
                  <p className="text-sm">{receiptData.phone}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Email</p>
                  <p className="text-sm">{receiptData.email}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Motif</p>
                  <p className="text-sm">
                    {receiptData.registrationFees && 'Frais d\'inscription'}
                    {receiptData.registrationFees && receiptData.tuitionFees && ' + '}
                    {receiptData.tuitionFees && 'Frais de scolaritÃ©'}
                    {!receiptData.registrationFees && !receiptData.tuitionFees && 'Aucun paiement'}
                  </p>
                </div>

                <div className="pt-4">
                  <p className="text-xs text-gray-400 uppercase mb-1">ArrÃªtÃ© la prÃ©sente somme Ã </p>
                  <p className="text-sm font-medium italic capitalize">
                    {totalInWords} francs CFA
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Payment Details */}
            <div className="w-1/2 p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 print:border-gray-400">
                  <span className="text-sm text-gray-600">Avance</span>
                  <span className="font-bold text-[#1067a8] print:text-black">
                    {totalPaid.toLocaleString()} CFA
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200 print:border-gray-400">
                  <span className="text-sm text-gray-600">Reste</span>
                  <span className="font-bold text-gray-900">
                    {remainingAmount.toLocaleString()} CFA
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200 print:border-gray-400">
                  <span className="text-sm text-gray-600">Mode de paiement</span>
                  <span className="font-medium">{getPaymentMethodLabel(receiptData.paymentMethod)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b-2 border-[#1067a8] print:border-black">
                  <span className="text-sm font-bold text-[#1067a8] print:text-black">Total</span>
                  <span className="text-xl font-bold text-[#1067a8] print:text-black">
                    {totalPaid.toLocaleString()} CFA
                  </span>
                </div>

                <div className="pt-4">
                  <p className="text-xs text-gray-400 uppercase mb-1">Date</p>
                  <p className="text-sm">{receiptData.date}</p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex border-t-2 border-black">
            {/* Signature Left */}
            <div className="w-1/2 border-r-2 border-black p-4">
              <p className="text-xs text-gray-400 uppercase mb-8">Signature de l'Ã©tudiant</p>
              <div className="border-t border-gray-300 pt-2">
                <p className="text-sm">{receiptData.lastName} {receiptData.firstName}</p>
              </div>
            </div>
            
            {/* Signature Right */}
            <div className="w-1/2 p-4">
              <p className="text-xs text-gray-400 uppercase mb-8">Signature de l'administration</p>
              <div className="border-t border-gray-300 pt-2">
                <p className="text-sm font-bold">{SCHOOL_INFO.name}</p>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t-2 border-black p-2 text-center">
            <p className="text-xs text-gray-400 print:text-gray-600">
              {SCHOOL_INFO.name} - {SCHOOL_INFO.contact} - {SCHOOL_INFO.address} | Ce reÃ§u est une preuve de paiement
            </p>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          body * {
            visibility: hidden;
          }
          #root {
            background: white !important;
          }
          div[ref="printRef"], div[ref="printRef"] * {
            visibility: visible;
          }
          div[ref="printRef"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};
