import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { RegisterPayment } from '../components/features/tuition/RegisterPayment';

const students = [
  { id: '1', name: 'Alice Johnson', email: 'alice@email.com', course: 'DÃ©veloppement Web', totalFees: 80000, paid: 65000, status: 'paid' },
  { id: '2', name: 'Bob Smith', email: 'bob@email.com', course: 'Data Science', totalFees: 100000, paid: 50000, status: 'partial' },
  { id: '3', name: 'Carol White', email: 'carol@email.com', course: 'Design UI/UX', totalFees: 75000, paid: 0, status: 'unpaid' },
  { id: '4', name: 'David Brown', email: 'david@email.com', course: 'Marketing Digital', totalFees: 65000, paid: 65000, status: 'paid' },
  { id: '5', name: 'Emma Wilson', email: 'emma@email.com', course: 'DÃ©veloppement Web', totalFees: 80000, paid: 80000, status: 'paid' },
  { id: '6', name: 'Frank Miller', email: 'frank@email.com', course: 'Data Science', totalFees: 100000, paid: 25000, status: 'partial' },
  { id: '7', name: 'Grace Lee', email: 'grace@email.com', course: 'Design UI/UX', totalFees: 75000, paid: 75000, status: 'paid' },
  { id: '8', name: 'Henry Taylor', email: 'henry@email.com', course: 'Marketing Digital', totalFees: 65000, paid: 0, status: 'unpaid' },
];

const payments = [
  { id: '1', studentId: '1', amount: 65000, date: '2024-09-15', method: 'EspÃ¨ces', status: 'completed' },
  { id: '2', studentId: '2', amount: 25000, date: '2024-09-20', method: 'Mobile Money', status: 'completed' },
  { id: '3', studentId: '2', amount: 25000, date: '2024-10-15', method: 'Mobile Money', status: 'completed' },
  { id: '4', studentId: '4', amount: 65000, date: '2024-09-10', method: 'Virement', status: 'completed' },
];

export const Tuition: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleOpenPaymentModal = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudent(studentId);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (paymentData: any) => {
    console.log('Payment recorded:', paymentData);
    setShowPaymentModal(false);
    setSelectedStudent(null);
    // Here you would typically update the state or make an API call
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = students.reduce((sum, s) => sum + s.paid, 0);
  const totalPending = students.filter(s => s.status !== 'paid').reduce((sum, s) => sum + (s.totalFees - s.paid), 0);
  const paidCount = students.filter(s => s.status === 'paid').length;
  const partialCount = students.filter(s => s.status === 'partial').length;
  const unpaidCount = students.filter(s => s.status === 'unpaid').length;

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: { bg: 'bg-green-50', text: 'text-green-600', icon: CheckCircleIcon, label: 'PayÃ©' },
      partial: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: ClockIcon, label: 'Partiel' },
      unpaid: { bg: 'bg-red-50', text: 'text-red-600', icon: XCircleIcon, label: 'ImpayÃ©' },
    };
    const style = styles[status as keyof typeof styles] || styles.unpaid;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3.5 h-3.5" />
        {style.label}
      </span>
    );
  };

  const calculateProgress = (paid: number, total: number) => {
    return (paid / total) * 100;
  };

  const getStudentPayments = (studentId: string) => {
    return payments.filter(p => p.studentId === studentId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">ScolaritÃ©</h1>
        <p className="text-sm text-gray-400 mt-1">Gestion des paiements et des frais de scolaritÃ©</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total perÃ§u</p>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} CFA</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{totalPending.toLocaleString()} CFA</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1067a8]/5 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-[#1067a8]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">PayÃ©s</p>
              <p className="text-2xl font-bold text-gray-900">{paidCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">ImpayÃ©s</p>
              <p className="text-2xl font-bold text-gray-900">{unpaidCount + partialCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="relative w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un Ã©tudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1067a8] focus:border-transparent transition-all"
            />
          </div>
          <span className="text-sm text-gray-500">
            {filteredStudents.length} rÃ©sultat(s)
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredStudents.map((student) => {
            const progress = calculateProgress(student.paid, student.totalFees);
            const isExpanded = expandedId === student.id;
            const studentPayments = getStudentPayments(student.id);

            return (
              <div key={student.id}>
                <div 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : student.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#1067a8]/5 flex items-center justify-center">
                        <span className="text-sm font-semibold text-[#1067a8]">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.course}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-gray-900">{student.paid.toLocaleString()} / {student.totalFees.toLocaleString()} CFA</p>
                        <p className="text-xs text-gray-400">Frais de scolaritÃ©</p>
                      </div>
                      <div className="w-32">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              student.status === 'paid' ? 'bg-green-500' : 
                              student.status === 'partial' ? 'bg-yellow-500' : 'bg-red-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      {getStatusBadge(student.status)}
                      {isExpanded ? (
                        <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-gray-50 px-4 py-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Historique des paiements</h4>
                    <div className="space-y-2">
                      {studentPayments.length > 0 ? (
                        studentPayments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{payment.amount.toLocaleString()} CFA</p>
                                <p className="text-xs text-gray-400">{payment.date} â€¢ {payment.method}</p>
                              </div>
                            </div>
                            <span className="text-xs text-green-600 font-medium">ComplÃ©tÃ©</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">Aucun paiement enregistrÃ©</p>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={(e) => handleOpenPaymentModal(student.id, e)}
                        className="px-3 py-1.5 bg-[#1067a8] text-white rounded-lg text-xs font-medium hover:bg-[#1067a8]/90"
                      >
                        Enregistrer un paiement
                      </button>
                      <button className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 flex items-center gap-1">
                        <PrinterIcon className="w-4 h-4" />
                        Imprimer facture
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showPaymentModal && selectedStudent && (
        <RegisterPayment 
          student={students.find(s => s.id === selectedStudent)!}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedStudent(null);
          }}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
};
