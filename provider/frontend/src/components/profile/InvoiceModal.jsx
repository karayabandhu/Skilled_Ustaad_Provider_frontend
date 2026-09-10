import React from "react";
import { X, Briefcase, MapPin, Phone, Mail, Download } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";

const InvoiceModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  // Real data from backend (prioritizing raw numeric fields to avoid string parsing issues)
  const jobValue = Number(
    transaction.servicePriceRaw ?? transaction.servicePrice ?? 0,
  );
  const commission = Number(
    transaction.adminCommissionRaw ?? transaction.adminCommission ?? 0,
  );
  const directIncome = Number(
    transaction.directPaymentRaw ?? transaction.directPayment ?? 0,
  );
  const walletIncome = Number(
    transaction.walletEarningRaw ?? transaction.providerWalletEarning ?? 0,
  );
  const totalAmount = Number(
    transaction.totalAmountRaw ?? transaction.totalAmount ?? 0,
  );

  // Total money the expert earned (Cash + Wallet)
  const totalExpertEarning = directIncome + walletIncome;

  // Total Customer Payment = expert net earning + platform commission
  const calculatedTotalAmount = totalAmount || (totalExpertEarning + commission);
  const addedFees = Math.max(0, calculatedTotalAmount - jobValue);

  const handleDownloadPDF = () => {
    const invoice = document.getElementById("invoice-print-area");
    if (!invoice) return;

    window.print();
  };

  return (
    <>
      <style>
        {`
      @media print {
        @page {
          size: A4;
          margin: 6mm;
        }

        html,
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          overflow: hidden !important;
        }

        body * {
          visibility: hidden !important;
        }

        #invoice-print-area,
        #invoice-print-area * {
          visibility: visible !important;
        }

        #invoice-print-area {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 128% !important;
          max-width: none !important;
          transform: scale(0.72);
          transform-origin: top left;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          background: white !important;
          overflow: visible !important;
        }

        #invoice-print-area > div:first-child {
          padding: 10px 14px !important;
        }

        #invoice-scroll-area {
          padding: 10px 14px !important;
          max-height: none !important;
          overflow: visible !important;
        }

        #invoice-scroll-area > div {
          margin-bottom: 10px !important;
        }

        #invoice-scroll-area > div:first-child {
          gap: 10px !important;
        }

        #invoice-scroll-area > div:nth-child(2) {
          padding: 12px !important;
          gap: 12px !important;
          margin-bottom: 10px !important;
        }

        table {
          margin-bottom: 10px !important;
          font-size: 12px !important;
        }

        th {
          padding-top: 6px !important;
          padding-bottom: 6px !important;
        }

        td {
          padding-top: 7px !important;
          padding-bottom: 7px !important;
        }

        tfoot td {
          padding-top: 10px !important;
          padding-bottom: 10px !important;
        }

        #invoice-print-area h3 {
          font-size: 16px !important;
          line-height: 1.1 !important;
        }

        #invoice-print-area h4 {
          font-size: 14px !important;
          margin-bottom: 2px !important;
        }

        #invoice-print-area p {
          line-height: 1.2 !important;
          margin-top: 0 !important;
          margin-bottom: 2px !important;
        }

        .invoice-print-hide {
          display: none !important;
        }
      }
    `}
      </style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div
          id="invoice-print-area"
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          {" "}
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Job Invoice
              </h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                Job ID:{" "}
                {(transaction._id || "").toString().slice(-12).toUpperCase()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="invoice-print-hide p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          {/* Invoice Content */}
          <div
            id="invoice-scroll-area"
            className="p-8 overflow-y-auto max-h-[70vh] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {" "}
            {/* <div className="p-8 overflow-y-auto max-h-[70vh] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"></div> */}{" "}
            <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
              {/* Branding */}
              <div>
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-4">
                  <Briefcase className="w-6 h-6" />
                  <span className="font-black text-xl tracking-tight">
                    Skilled Ustaad
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Digital Service Platform
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Support: +91 9754368885
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3 h-3" /> support@skilledustaad.com
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="text-right">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Tax Invoice
                </h4>
                <p className="text-xs text-gray-500">
                  #{transaction.transactionId || "N/A"}
                </p>
                <div className="mt-4 text-xs space-y-1">
                  <p>
                    <span className="text-gray-500">Date:</span>{" "}
                    <span className="font-bold dark:text-white">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Status:</span>{" "}
                    <span className="font-bold text-green-600">
                      {transaction.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Service Expert
                </p>
                <p className="text-sm font-bold dark:text-white">
                  Expert ID:{" "}
                  {(transaction.provider || "")
                    .toString()
                    .slice(-6)
                    .toUpperCase() || "Verified Expert"}
                </p>
                <p className="text-xs text-gray-500">
                  Skilled Ustaad Registered Provider
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Customer
                </p>
                <p className="text-sm font-bold dark:text-white">
                  {transaction.client?.fullName || "Valued Customer"}
                </p>
                <p className="text-xs text-gray-500">
                  Location:{" "}
                  {transaction.bookingId?.address || "Service Location"}
                </p>
              </div>
            </div>
            {/* Table */}
            <table className="w-full text-left mb-8">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="py-3">Description</th>
                  <th className="py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-50 dark:border-gray-800/50">
                  <td className="py-4">
                    <p className="font-bold dark:text-white">
                      {transaction.serviceType || "Professional Service"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Base Job Value
                    </p>
                  </td>
                  <td className="py-4 text-right font-bold dark:text-white">
                    {formatCurrency(jobValue)}
                  </td>
                </tr>
                <tr className="border-b border-gray-50 dark:border-gray-800/50">
                  <td className="py-4">
                    <p className="font-bold dark:text-white">
                      Customer Platform Fee & GST (Added)
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Added charges paid by customer
                    </p>
                  </td>
                  <td className="py-4 text-right font-bold text-gray-700 dark:text-gray-300">
                    {formatCurrency(addedFees)}
                  </td>
                </tr>
                <tr className="border-b border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/10">
                  <td className="py-4 font-black dark:text-white">
                    Total Customer Payment
                  </td>
                  <td className="py-4 text-right font-black dark:text-white">
                    {formatCurrency(calculatedTotalAmount)}
                  </td>
                </tr>
                <tr className="text-rose-500">
                  <td className="py-4 text-xs font-medium italic">
                    Platform Commission & Service GST (Deducted)
                  </td>
                  <td className="py-4 text-right text-xs font-bold">
                    -{formatCurrency(commission)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-6 text-right font-bold text-gray-500">
                    Total Net Earning:
                  </td>
                  <td className="py-6 text-right text-xl font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(totalExpertEarning)}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mb-2 uppercase tracking-wide">
                Earning Breakdown
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-gray-500 font-medium">
                    Platform Wallet
                  </p>
                  <p className="text-xs font-bold text-blue-600">
                    {formatCurrency(walletIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 font-medium">
                    Direct Cash Receipt
                  </p>
                  <p className="text-xs font-bold text-emerald-600">
                    {formatCurrency(directIncome)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Modal Footer */}
          <div className="invoice-print-hide p-6 border-t border-gray-50 dark:border-gray-700 flex justify-end">
            {" "}
            <button
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              onClick={handleDownloadPDF}
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceModal;
