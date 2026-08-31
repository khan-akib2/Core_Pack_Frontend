'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Save, CheckCircle2 } from 'lucide-react';
import { useCustomModal } from '@/components/providers/ModalProvider';
import Link from 'next/link';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

export default function SettingsPage() {
  const { showAlert } = useCustomModal();
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [gstin, setGstin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [pincode, setPincode] = useState('');

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branch, setBranch] = useState('');

  const [certificationText, setCertificationText] = useState('');
  const [challanBannerText, setChallanBannerText] = useState('');

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      NativeBiometric.isAvailable().then((result) => {
        if (result.isAvailable) {
          setHasBiometric(true);
          const enabled = localStorage.getItem('cp_biometric_enabled') === 'true';
          setIsBiometricEnabled(enabled);
        }
      }).catch(err => console.log(err));
    }
  }, []);

  const handleBiometricToggle = async () => {
    if (!isBiometricEnabled) {
      try {
        await NativeBiometric.verifyIdentity({
          reason: "Authenticate to enable Biometric Unlock",
          title: "Enable Biometric Unlock"
        });
        localStorage.setItem('cp_biometric_enabled', 'true');
        setIsBiometricEnabled(true);
        showAlert({ title: 'Biometric Enabled', message: 'Biometric unlock is now active.', variant: 'success' });
      } catch (err) {
        showAlert({ title: 'Biometric Setup Failed', message: 'Could not verify identity.', variant: 'danger' });
      }
    } else {
      localStorage.removeItem('cp_biometric_enabled');
      setIsBiometricEnabled(false);
      showAlert({ title: 'Biometric Disabled', message: 'Biometric unlock is turned off.', variant: 'success' });
    }
  };

  const { data: company, isLoading } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const res = await api.get('/company');
      return res.data.data;
    }
  });

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName || '');
      setTagline(company.tagline || '');
      setGstin(company.gstin || '');
      setEmail(company.email || '');
      setPhone(company.phone || '');

      setStreet(company.address?.street || '');
      setCity(company.address?.city || '');
      setState(company.address?.state || '');
      setStateCode(company.address?.stateCode || '');
      setPincode(company.address?.pincode || '');

      setBankName(company.bankDetails?.bankName || '');
      setAccountNumber(company.bankDetails?.accountNumber || company.bankDetails?.accountNo || '');
      setIfscCode(company.bankDetails?.ifscCode || company.bankDetails?.ifsc || '');
      setBranch(company.bankDetails?.branch || '');

      setCertificationText(company.certificationText || 'I/We hereby certify that my/our registration certificate under the Goods and Service Tax, is in force on the date on which the sale of goods specified on this Tax Invoice is made by me/us & that the transaction of sale covered by this Tax Invoice has been affected by me/us & it shall be accounted for in the turnover of sales while filing of return & the due Tax, if any, payable on the sale has been paid or shall be paid.');
      setChallanBannerText(company.challanBannerText || 'Please receive the following goods in good order & condition.');
    }
  }, [company]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put('/company', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
      setSuccessMsg('Company Profile & Customizable Messages Updated Successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err) => {
      showAlert({
        title: 'Settings Update Failed',
        message: err.response?.data?.message || err.message || 'Failed to save settings.',
        variant: 'danger'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      companyName,
      tagline,
      gstin,
      email,
      phone,
      address: { street, city, state, pincode, stateCode, country: 'India' },
      bankDetails: { bankName, accountNumber, accountNo: accountNumber, ifscCode, ifsc: ifscCode, branch },
      certificationText,
      challanBannerText
    });
  };

  if (isLoading) return <p className="text-slate-400 p-8 text-center text-xs font-medium">Loading Company Profile Settings...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12 antialiased">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-2">
        <div className="mb-2 sm:mb-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Company & Print Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure Core Pack India identity, GST credentials, Bank A/C & customizable print messages</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto pt-2 sm:pt-0">
          <Link href="/settings/whatsapp" className="w-full sm:w-auto">
            <Button type="button" variant="outline" className="flex items-center justify-center gap-2 w-full whitespace-nowrap text-green-600 border-green-200 hover:bg-green-50">
              WhatsApp Integration
            </Button>
          </Link>
          <Button type="submit" disabled={updateSettingsMutation.isPending} className="flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap">
            <Save className="w-4 h-4 shrink-0" />
            <span className="truncate">{updateSettingsMutation.isPending ? 'Saving...' : 'Save Configuration'}</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-xs font-semibold shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <Card className="p-6 border-slate-200/80 space-y-5">
        <h2 className="text-sm font-bold text-orange-600 border-b border-slate-100 pb-2">Business Identity & GST Registration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          <Input label="Tagline / Description" value={tagline} onChange={(e) => setTagline(e.target.value)} />
          <Input label="GSTIN *" value={gstin} onChange={(e) => setGstin(e.target.value)} required />
          <Input label="Official Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Official Phone *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
      </Card>

      <Card className="p-6 border-slate-200/80 space-y-5">
        <h2 className="text-sm font-bold text-orange-600 border-b border-slate-100 pb-2">Customizable Printable Messages & Declarations</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Custom Tax Invoice Terms & GST Certification Statement
            </label>
            <textarea
              rows={3}
              value={certificationText}
              onChange={(e) => setCertificationText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500 font-normal leading-relaxed"
              placeholder="Custom declaration statement printed on bottom of tax invoices..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Custom Delivery Challan Sub-Banner Message
            </label>
            <input
              type="text"
              value={challanBannerText}
              onChange={(e) => setChallanBannerText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-orange-500 font-normal"
              placeholder="Custom delivery condition message printed on challan header..."
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 border-slate-200/80 space-y-5">
        <h2 className="text-sm font-bold text-orange-600 border-b border-slate-100 pb-2">Registered Factory / Office Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Street / Plot / MIDC Area" value={street} onChange={(e) => setStreet(e.target.value)} className="md:col-span-2" />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
          <Input label="GST State Code" value={stateCode} onChange={(e) => setStateCode(e.target.value)} placeholder="e.g. 27 for Maharashtra" />
          <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </div>
      </Card>

      <Card className="p-6 border-slate-200/80 space-y-5">
        <h2 className="text-sm font-bold text-orange-600 border-b border-slate-100 pb-2">Bank Account Details (Printed on Invoices)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
          <Input label="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
          <Input label="IFSC Code" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} />
          <Input label="Branch Name" value={branch} onChange={(e) => setBranch(e.target.value)} />
        </div>
      </Card>

      {hasBiometric && (
        <Card className="p-6 border-slate-200/80 space-y-5 bg-orange-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-orange-600">Device Security (App Only)</h2>
              <p className="text-xs text-slate-500 mt-1">Enable Biometric Unlock to securely login using your fingerprint or Face ID.</p>
            </div>
            <Button
              type="button"
              variant={isBiometricEnabled ? "outline" : "default"}
              onClick={handleBiometricToggle}
              className={isBiometricEnabled ? "border-red-200 text-red-600 hover:bg-red-50" : ""}
            >
              {isBiometricEnabled ? "Disable Biometric Unlock" : "Enable Biometric Unlock"}
            </Button>
          </div>
        </Card>
      )}
    </form>
  );
}
