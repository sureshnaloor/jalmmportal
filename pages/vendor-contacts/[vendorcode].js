import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import HeaderComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function displayValue(value) {
  if (value == null || String(value).trim() === '') return 'N/A';
  return String(value);
}

function formatDateTime(value) {
  if (!value) return 'N/A';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return 'N/A';
  }
}

function MetaFooter({ updatedBy, updatedAt }) {
  return (
    <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
      Last updated by <span className="font-medium">{displayValue(updatedBy)}</span>
      {' '}on <span className="font-medium">{formatDateTime(updatedAt)}</span>
    </p>
  );
}

function SectionCard({ title, editing, onEdit, onCancel, children, editForm }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/70 shadow-[0_20px_55px_rgba(15,23,42,0.12)] p-6">
      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            Edit
          </button>
        )}
        {editing && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-full text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
      {editing ? editForm : children}
    </div>
  );
}

const VENDORS_CONTACT_FIELDS = [
  { key: 'telephone1', label: 'Telephone 1' },
  { key: 'telephone2', label: 'Telephone 2' },
  { key: 'fax', label: 'Fax' },
  { key: 'salesname', label: 'Sales Name' },
  { key: 'salesemail', label: 'Sales Email' },
  { key: 'salesmobile', label: 'Sales Mobile' },
];

const VENDORADDRESS_FIELDS = [
  { key: 'vendor-accountperson', label: 'Account Person' },
  { key: 'email1', label: 'Email 1' },
  { key: 'email2', label: 'Email 2' },
  { key: 'email3', label: 'Email 3' },
  { key: 'email4', label: 'Email 4' },
  { key: 'email5', label: 'Email 5' },
  { key: 'street', label: 'Street' },
  { key: 'address1', label: 'Address 1' },
  { key: 'address2', label: 'Address 2' },
  { key: 'district', label: 'District' },
  { key: 'city', label: 'City' },
  { key: 'pobox', label: 'P.O. Box' },
  { key: 'zipcode', label: 'Zip Code' },
  { key: 'countrycode', label: 'Country Code' },
];

const EMPTY_SALESPERSON = {
  name: '',
  email: '',
  mobile: '',
  landline: '',
  remarks: '',
};

export default function VendorContactDetailPage() {
  const router = useRouter();
  const { vendorcode, vendorName: queryVendorName } = router.query;
  const { data: session } = useSession();
  const editorName = session?.user?.name || session?.user?.email || 'admin';

  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);

  const [vendorsContactForm, setVendorsContactForm] = useState({});
  const [contactInfoForm, setContactInfoForm] = useState('');
  const [vendorAddressForm, setVendorAddressForm] = useState({});
  const [salespersonsForm, setSalespersonsForm] = useState([]);

  const effectiveCode = Array.isArray(vendorcode) ? vendorcode[0] : vendorcode;
  const displayName =
    contactData?.vendorName ||
    (Array.isArray(queryVendorName) ? queryVendorName[0] : queryVendorName) ||
    '';

  const loadContactData = async (code) => {
    if (!code) return;
    setLoading(true);
    setEditingSection(null);
    try {
      const res = await fetch(`/api/vendor-contacts/${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error('Failed to load vendor contact data');
      const data = await res.json();
      setContactData(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vendor contact data');
      setContactData(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (router.isReady && effectiveCode) {
      loadContactData(effectiveCode);
    }
  }, [router.isReady, effectiveCode]);

  const startEdit = (section) => {
    if (!contactData) return;
    if (section === 'vendorsContact') {
      setVendorsContactForm(contactData.vendorsContact?.data || {});
    } else if (section === 'contactInfo') {
      setContactInfoForm(contactData.vendorsDataContactInfo?.data || '');
    } else if (section === 'vendorAddress') {
      const addr = contactData.vendorAddress?.data || {};
      const form = {};
      VENDORADDRESS_FIELDS.forEach(({ key }) => {
        form[key] = addr[key] ?? '';
      });
      setVendorAddressForm(form);
      const existing = Array.isArray(addr.salespersons) ? addr.salespersons : [];
      setSalespersonsForm(
        existing.length > 0
          ? existing.map((person) => ({ ...EMPTY_SALESPERSON, ...person }))
          : [{ ...EMPTY_SALESPERSON }]
      );
    }
    setEditingSection(section);
  };

  const addSalesperson = () => {
    setSalespersonsForm((prev) => [...prev, { ...EMPTY_SALESPERSON }]);
  };

  const removeSalesperson = (index) => {
    setSalespersonsForm((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSalesperson = (index, field, value) => {
    setSalespersonsForm((prev) =>
      prev.map((person, i) => (i === index ? { ...person, [field]: value } : person))
    );
  };

  const saveVendorsContact = async (e) => {
    e.preventDefault();
    if (!effectiveCode) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/vendor-contacts/vendors-contact/${encodeURIComponent(effectiveCode)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...vendorsContactForm,
            vendorName: displayName,
            username: editorName,
          }),
        }
      );
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Save failed');
      toast.success('Vendor contact saved');
      setEditingSection(null);
      loadContactData(effectiveCode);
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const saveContactInfo = async (e) => {
    e.preventDefault();
    if (!effectiveCode) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/vendor-contacts/contact-info/${encodeURIComponent(effectiveCode)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactInfo: contactInfoForm,
            vendorName: displayName,
            username: editorName,
          }),
        }
      );
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Save failed');
      toast.success('Contact info saved');
      setEditingSection(null);
      loadContactData(effectiveCode);
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const saveVendorAddress = async (e) => {
    e.preventDefault();
    if (!effectiveCode) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/vendor-contacts/vendoraddress/${encodeURIComponent(effectiveCode)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              ...vendorAddressForm,
              salespersons: salespersonsForm,
            },
            username: editorName,
          }),
        }
      );
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Save failed');
      toast.success('Vendor address record saved');
      setEditingSection(null);
      loadContactData(effectiveCode);
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const salespersons = contactData?.vendorAddress?.data?.salespersons;
  const hasSalespersons = Array.isArray(salespersons) && salespersons.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <HeaderComponent />
      <ToastContainer position="top-right" autoClose={3000} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/vendor-contacts"
              className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
            >
              ← Back to active vendors
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Vendor Contacts & Address</h1>
          </div>
        </div>

        {effectiveCode && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{displayName || 'N/A'}</span>
              {' '}— Code: <span className="font-mono">{effectiveCode}</span>
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <span className="ml-3 text-slate-600">Loading contact data...</span>
          </div>
        )}

        {!loading && contactData && (
          <div className="space-y-6">
            <SectionCard
              title="Vendor Sales Contact"
              editing={editingSection === 'vendorsContact'}
              onEdit={() => startEdit('vendorsContact')}
              onCancel={() => setEditingSection(null)}
              editForm={
                <form onSubmit={saveVendorsContact} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {VENDORS_CONTACT_FIELDS.map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                        <input
                          type="text"
                          value={vendorsContactForm[key] || ''}
                          onChange={(e) =>
                            setVendorsContactForm({ ...vendorsContactForm, [key]: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Contact'}
                    </button>
                  </div>
                </form>
              }
            >
              {!contactData.vendorsContact?.exists ? (
                <p className="text-sm text-slate-600">No vendor sales contact on file. Use Edit to add details.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {VENDORS_CONTACT_FIELDS.map(({ key, label }) => (
                    <p key={key}>
                      <span className="font-medium text-slate-700">{label}:</span>{' '}
                      {displayValue(contactData.vendorsContact?.data?.[key])}
                    </p>
                  ))}
                </div>
              )}
              <MetaFooter
                updatedBy={contactData.vendorsContact?.updated_by}
                updatedAt={contactData.vendorsContact?.updated_at}
              />
            </SectionCard>

            <SectionCard
              title="Contact Info"
              editing={editingSection === 'contactInfo'}
              onEdit={() => startEdit('contactInfo')}
              onCancel={() => setEditingSection(null)}
              editForm={
                <form onSubmit={saveContactInfo} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Info</label>
                    <textarea
                      value={contactInfoForm}
                      onChange={(e) => setContactInfoForm(e.target.value)}
                      rows={6}
                      placeholder="Address, phone, email, and other contact details..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Contact Info'}
                    </button>
                  </div>
                </form>
              }
            >
              {!contactData.vendorsDataContactInfo?.exists ? (
                <p className="text-sm text-slate-600">No contact info on file. Use Edit to add details.</p>
              ) : (
                <div className="text-sm whitespace-pre-wrap text-slate-800">
                  {displayValue(contactData.vendorsDataContactInfo?.data)}
                </div>
              )}
              <MetaFooter
                updatedBy={contactData.vendorsDataContactInfo?.updated_by}
                updatedAt={contactData.vendorsDataContactInfo?.updated_at}
              />
            </SectionCard>

            <SectionCard
              title="Vendor Address"
              editing={editingSection === 'vendorAddress'}
              onEdit={() => startEdit('vendorAddress')}
              onCancel={() => setEditingSection(null)}
              editForm={
                <form onSubmit={saveVendorAddress} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {VENDORADDRESS_FIELDS.map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                        <input
                          type="text"
                          value={vendorAddressForm[key] || ''}
                          onChange={(e) =>
                            setVendorAddressForm({ ...vendorAddressForm, [key]: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-800">Additional Salesperson Details</h4>
                      <button
                        type="button"
                        onClick={addSalesperson}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500"
                      >
                        + Add Salesperson
                      </button>
                    </div>

                    <div className="space-y-4">
                      {salespersonsForm.map((person, index) => (
                        <div
                          key={`salesperson-${index}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-700">
                              Salesperson {index + 1}
                            </span>
                            {salespersonsForm.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSalesperson(index)}
                                className="text-sm text-red-600 hover:text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                              <input
                                type="text"
                                value={person.name}
                                onChange={(e) => updateSalesperson(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={person.email}
                                onChange={(e) => updateSalesperson(index, 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                              <input
                                type="text"
                                value={person.mobile}
                                onChange={(e) => updateSalesperson(index, 'mobile', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Landline</label>
                              <input
                                type="text"
                                value={person.landline}
                                onChange={(e) => updateSalesperson(index, 'landline', e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                              <textarea
                                value={person.remarks}
                                onChange={(e) => updateSalesperson(index, 'remarks', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Address Record'}
                    </button>
                  </div>
                </form>
              }
            >
              {!contactData.vendorAddress?.exists ? (
                <p className="text-sm text-slate-600">No vendor address on file. Use Edit to add details.</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {VENDORADDRESS_FIELDS.map(({ key, label }) => (
                      <p key={key}>
                        <span className="font-medium text-slate-700">{label}:</span>{' '}
                        {displayValue(contactData.vendorAddress?.data?.[key])}
                      </p>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Additional Salesperson Details</h4>
                    {!hasSalespersons ? (
                      <p className="text-sm text-slate-600">N/A</p>
                    ) : (
                      <div className="space-y-3">
                        {salespersons.map((person, index) => (
                          <div
                            key={`view-salesperson-${index}`}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"
                          >
                            <p className="font-medium text-slate-800 mb-2">Salesperson {index + 1}</p>
                            <p><span className="font-medium">Name:</span> {displayValue(person.name)}</p>
                            <p><span className="font-medium">Email:</span> {displayValue(person.email)}</p>
                            <p><span className="font-medium">Mobile:</span> {displayValue(person.mobile)}</p>
                            <p><span className="font-medium">Landline:</span> {displayValue(person.landline)}</p>
                            <p className="whitespace-pre-wrap">
                              <span className="font-medium">Remarks:</span> {displayValue(person.remarks)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              <MetaFooter
                updatedBy={contactData.vendorAddress?.updated_by}
                updatedAt={contactData.vendorAddress?.updated_at}
              />
            </SectionCard>
          </div>
        )}

        {!loading && !contactData && effectiveCode && (
          <p className="text-center text-slate-500 py-12">Could not load contact data for this vendor.</p>
        )}
      </main>

      <FooterComponent />
    </div>
  );
}
