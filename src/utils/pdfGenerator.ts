import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { GymProfile } from '../types';

export const generateInvoicePDF = (
  memberDetails: {
    name: string;
    phone: string;
    plan: string;
    amountPaid: number;
    joinDate: string;
    expiryDate: string;
    paymentMethod: string;
  },
  gymProfile: GymProfile
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(0, 153, 255);
  doc.text(gymProfile.name || 'RK FITNESS', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Phone: ${gymProfile.phone || 'N/A'}`, 14, 30);
  doc.text(`Email: ${gymProfile.email || 'N/A'}`, 14, 35);
  doc.text(`Address: ${(gymProfile as any).address || 'N/A'}`, 14, 40);

  // Invoice Details
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('INVOICE', 140, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 30);
  
  // Billed To
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Billed To:', 14, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Name: ${memberDetails.name}`, 14, 62);
  doc.text(`Phone: ${memberDetails.phone}`, 14, 67);
  
  // Table
  autoTable(doc, {
    startY: 80,
    head: [['Description', 'Duration / Dates', 'Amount']],
    body: [
      [
        `Membership Plan - ${memberDetails.plan}`,
        `${memberDetails.joinDate} to ${memberDetails.expiryDate}`,
        `Rs. ${memberDetails.amountPaid}`
      ]
    ],
    theme: 'striped',
    headStyles: { fillColor: [0, 153, 255] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;

  // Footer / Total
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Payment Method: ${memberDetails.paymentMethod}`, 14, finalY + 15);
  
  doc.setFontSize(14);
  doc.text(`Total Paid: Rs. ${memberDetails.amountPaid}`, 140, finalY + 15);

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing us!', 105, 280, { align: 'center' });

  // Save the PDF
  doc.save(`${memberDetails.name.replace(/\s+/g, '_')}_Invoice.pdf`);
};

export const generateWhatsAppLink = (
  memberDetails: {
    name: string;
    phone: string;
    plan: string;
    amountPaid: number;
    expiryDate: string;
  },
  gymProfile: GymProfile
) => {
  const cleanPhone = memberDetails.phone.replace(/\D/g, '');
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const text = `Hi ${memberDetails.name},

Welcome to *${gymProfile.name || 'Our Gym'}*! 💪

We have received your payment of *Rs. ${memberDetails.amountPaid}* for the *${memberDetails.plan}*.
Your membership is active until *${memberDetails.expiryDate}*.

I have generated your PDF invoice (can be attached to this chat).

Thank you for joining us! Let's get fit! 🏋️‍♂️`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
};
