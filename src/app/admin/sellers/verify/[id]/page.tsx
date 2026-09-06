"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/app/components/layout/AdminSidebar'; 
import { CheckCircle, XCircle, Clock, ChevronLeft, Loader2, AlertCircle, MessageSquare } from 'lucide-react';

export default function SellerVerificationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // NEW: State to toggle the Reject Panel visibility
  const [showRejectPanel, setShowRejectPanel] = useState(false);

  // State for Checkboxes
  const [rejectedFields, setRejectedFields] = useState({
    idDocumentFront: false,
    idDocumentBack: false,
    nicNo: false,
    dateOfBirth: false
  });

  // State for Custom Typed Reason
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem('adminToken');
      try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiBase}/sellers/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) setSeller(result.data);
      } catch (err) {
        console.error("Failed to fetch seller details", err);
      }
    };
    fetchDetails();
  }, [id]);

  const handleAction = async (status: 'approved' | 'rejected') => {
    setIsUpdating(true);
    const token = localStorage.getItem('adminToken');
    let finalRejectionReason: string | null = null;

    if (status === 'rejected') {
      // Typed array for rejection items to avoid `never[]` inference
      type RejectionItem = { field: string; label: string; status: string; message: string };
      const items: RejectionItem[] = [];
      
      // 1. Add standard items based on checkboxes
      if (rejectedFields.idDocumentFront) {
        items.push({ field: "idDocumentFront", label: "ID Document (Front Side)", status: "missing", message: "Please upload a clear front-side image of your ID." });
      }
      if (rejectedFields.idDocumentBack) {
        items.push({ field: "idDocumentBack", label: "ID Document (Back Side)", status: "missing", message: "Please upload a clear back-side image of your ID." });
      }
      if (rejectedFields.nicNo) {
        items.push({ field: "nicNo", label: "NIC / Passport Number", status: "incorrect", message: "The number does not match the submitted document." });
      }
      if (rejectedFields.dateOfBirth) {
        items.push({ field: "dateOfBirth", label: "Date of Birth", status: "mismatch", message: "The date of birth does not match the document." });
      }

      // 2. Add the custom message as a special item if typed
      if (customMessage.trim()) {
        items.push({ 
          field: "adminNote", 
          label: "Admin Comments", 
          status: "info", 
          message: customMessage.trim() 
        });
      }

      // Validation: Must have at least one reason
      if (items.length === 0) {
        alert("Please select at least one reason or type a custom message for rejection.");
        setIsUpdating(false);
        return;
      }

      // 3. Construct the final JSON object
        finalRejectionReason = JSON.stringify({
        summary: "Your verification could not be approved...",
        items: items
        });
    }

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiBase}/sellers/${id}/verify`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
        status, 
        rejection_reason: finalRejectionReason, 
        kyc_approval_page_seen: false 
        })
      });

      if (res.ok) {
        router.push('/admin/sellers');
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!seller) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFB]">
      <Loader2 className="animate-spin text-[#149984] h-10 w-10" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFB]">
      <AdminSidebar />

      <main className="flex-1 p-8 antialiased">
        <button onClick={() => router.push('/admin/sellers')} className="flex items-center gap-2 text-gray-700 mb-6 hover:text-[#149984] font-bold transition-colors">
          <ChevronLeft size={20} /> Back to Sellers
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#23262f]">Verification Review</h1>
          <span className="flex items-center gap-2 px-5 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-black uppercase tracking-widest">
            <Clock size={18} /> {seller.verification_status || 'Pending'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Document Display */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-[#23262f] mb-8 border-b pb-4">Seller Details</h2>
              <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                <div><p className="text-gray-400 font-bold mb-1 uppercase text-[10px]">Full Name</p><p className="font-extrabold text-[#23262f] text-lg">{seller.full_name}</p></div>
                <div><p className="text-gray-400 font-bold mb-1 uppercase text-[10px]">Phone Number</p><p className="font-extrabold text-[#23262f] text-lg">{seller.phone_no}</p></div>
                <div><p className="text-gray-400 font-bold mb-1 uppercase text-[10px]">NIC Number</p><p className="font-extrabold text-[#23262f] text-lg">{seller.nic_no}</p></div>
                <div><p className="text-gray-400 font-bold mb-1 uppercase text-[10px]">Nationality</p><p className="font-extrabold text-[#23262f] text-lg">{seller.nationality}</p></div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-black text-[#23262f] mb-8">Verification Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[11px] font-bold text-gray-500 mb-3 uppercase">ID Front Image</p>
                  <img src={seller.id_document_front_url || seller.Id_photo_path} className="rounded-2xl border-2 border-gray-100 w-full" alt="ID Front" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-500 mb-3 uppercase">ID Back Image</p>
                  <img src={seller.id_document_back_url} className="rounded-2xl border-2 border-gray-100 w-full" alt="ID Back" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Decisions & Rejection Logic */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg sticky top-8">
              <h2 className="text-xl font-black text-[#23262f] mb-6">Decision Panel</h2>
              
              {/* CONDITIONAL RENDERING STARTS HERE */}
              {/* Ensure this opening curly brace '{' is right here! ---> */}
              {!showRejectPanel ? (
                
                /* VIEW 1: CLEAN VIEW (Only 2 Buttons) */
                <div className="space-y-4">
                  <button 
                    onClick={() => handleAction('approved')} 
                    disabled={isUpdating}
                    className="w-full py-4 bg-[#149984] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-[#11806e] transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isUpdating ? <Loader2 className="animate-spin" /> : <><CheckCircle size={20} /> APPROVE SELLER</>}
                  </button>
                  
                  <button 
                    onClick={() => setShowRejectPanel(true)} 
                    className="w-full py-4 bg-white text-red-600 border-2 border-red-100 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-red-50 transition-all shadow-sm"
                  >
                    <XCircle size={20} /> REJECT SELLER
                  </button>
                </div>

              ) : (

                /* VIEW 2: REJECTION FORM (Checkboxes, Textarea, Confirm) */
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  {/* 1. Checkboxes */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Flag Issues</label>
                    {[
                      { id: 'idDocumentFront', label: 'ID Front Missing/Blurry' },
                      { id: 'idDocumentBack', label: 'ID Back Missing/Blurry' },
                      { id: 'nicNo', label: 'NIC Number Mismatch' },
                      { id: 'dateOfBirth', label: 'DOB Mismatch' },
                    ].map((item) => (
                      <label key={item.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-50 hover:bg-red-50 cursor-pointer transition-all">
                        <input 
                          type="checkbox" 
                          className="h-5 w-5 accent-red-600"
                          checked={(rejectedFields as any)[item.id]}
                          onChange={(e) => setRejectedFields({...rejectedFields, [item.id]: e.target.checked})}
                        />
                        <span className="text-sm font-bold text-[#23262f]">{item.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* 2. Textarea */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Additional Instructions</label>
                    <div className="relative">
                      <MessageSquare size={16} className="absolute left-4 top-4 text-gray-300" />
                      <textarea 
                        className="w-full pl-11 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-600 min-h-[120px] focus:bg-white focus:border-[#149984] outline-none transition-all placeholder:text-gray-300"
                        placeholder="Type a custom message for the seller..."
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 3. Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => setShowRejectPanel(false)} 
                      className="w-1/3 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all"
                    >
                      CANCEL
                    </button>
                    
                    <button 
                      onClick={() => handleAction('rejected')} 
                      disabled={isUpdating}
                      className="w-2/3 py-3 bg-red-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 shadow-sm"
                    >
                      {isUpdating ? <Loader2 className="animate-spin" /> : 'CONFIRM REJECT'}
                    </button>
                  </div>

                  <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-2xl">
                    <AlertCircle size={16} className="text-blue-500 mt-0.5" />
                    <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                      Selecting checkboxes helps the user fix their application quickly.
                    </p>
                  </div>
                </div>

              )}
              {/* CONDITIONAL RENDERING ENDS HERE */}
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}