'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  useProviderProfile,
  useUpdateProvider,
  useSubmitForReview,
  useCreateShowroom,
  useUpdateShowroom,
  useDeleteShowroom,
} from '../../../../hooks/useProviderProfile';
import { providersApi } from '../../../../lib/api/providers.api';
import {
  createProviderSchema,
  updateProviderSchema,
  showroomSchema,
  type CreateProviderFormValues,
  type UpdateProviderFormValues,
  type ShowroomFormValues,
} from '../../../../lib/validations/provider.schema';
import { ImageUpload } from '../../../../components/uploads/ImageUpload';
import { DocumentUpload } from '../../../../components/uploads/DocumentUpload';
import { StatusBadge } from '../../../../components/common/StatusBadge';

type TabKey = 'profile' | 'showroom' | 'documents' | 'submit';

const TABS: { key: TabKey; label: string; step: number }[] = [
  { key: 'profile',   label: '1. Business Info',  step: 1 },
  { key: 'showroom',  label: '2. Showroom',        step: 2 },
  { key: 'documents', label: '3. Documents',       step: 3 },
  { key: 'submit',    label: '4. Submit',          step: 4 },
];

export default function ProviderProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [isCreating, setIsCreating] = useState(false);

  const { data: profile, isLoading } = useProviderProfile();
  const updateProvider = useUpdateProvider();
  const submitForReview = useSubmitForReview();
  const createShowroom = useCreateShowroom();
  const updateShowroom = useUpdateShowroom();
  const deleteShowroom = useDeleteShowroom();
  const [editingShowroom, setEditingShowroom] = useState(false);

  // ── Profile form ────────────────────────────────────────────────────────

  const profileForm = useForm<UpdateProviderFormValues>({
    resolver: zodResolver(profile ? updateProviderSchema : createProviderSchema),
    values: profile
      ? {
          businessName: profile.businessName,
          businessDescription: profile.businessDescription ?? '',
        }
      : undefined,
  });

  const createForm = useForm<CreateProviderFormValues>({
    resolver: zodResolver(createProviderSchema),
  });

  // ── Showroom form ────────────────────────────────────────────────────────

  const showroomForm = useForm<ShowroomFormValues>({
    resolver: zodResolver(showroomSchema),
  });

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleCreateProfile = async (data: CreateProviderFormValues) => {
    setIsCreating(true);
    try {
      await providersApi.create(data);
      toast.success('Business profile created!');
      router.refresh();
      setActiveTab('showroom');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to create profile';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateProfile = async (data: UpdateProviderFormValues) => {
    await updateProvider.mutateAsync(data);
    setActiveTab('showroom');
  };

  const handleLogoUpload = async (url: string) => {
    if (!url) return;
    await updateProvider.mutateAsync({ logoUrl: url });
  };

  const handleBannerUpload = async (url: string) => {
    if (!url) return;
    await updateProvider.mutateAsync({ bannerUrl: url });
  };

  const handleAddShowroom = async (data: ShowroomFormValues) => {
    await createShowroom.mutateAsync(data);
    showroomForm.reset();
    setActiveTab('documents');
  };

  const handleUpdateShowroom = async (data: ShowroomFormValues) => {
    const showroom = profile?.showrooms?.[0];
    if (!showroom) return;
    await updateShowroom.mutateAsync({ showroomId: showroom.id, data });
    setEditingShowroom(false);
  };

  const handleDocumentUploaded = () => {
    // Profile query auto-refreshes via mutation invalidation
  };

  const handleSubmitForReview = async () => {
    await submitForReview.mutateAsync();
  };

  // ── Loading state ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const completeness = profile?.completenessScore;
  const canSubmit = (completeness?.score ?? 0) >= 60;
  const isAlreadySubmitted = ['PENDING_REVIEW', 'APPROVED'].includes(
    profile?.verificationStatus ?? '',
  );

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Provider Profile</h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete your profile to start listing vehicles.
          </p>
        </div>
        {profile && (
          <StatusBadge status={profile.verificationStatus} />
        )}
      </div>

      {/* Rejection notice */}
      {profile?.verificationStatus === 'REJECTED' && profile.rejectionReason && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800 mb-1">Profile rejected</p>
          <p className="text-sm text-red-700">{profile.rejectionReason}</p>
          <p className="text-xs text-red-500 mt-2">
            Please update your details and resubmit for review.
          </p>
        </div>
      )}

      {/* Progress bar */}
      {profile && completeness && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700">Profile completeness</p>
            <span className="text-sm font-bold text-slate-900">{completeness.score}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${completeness.score}%` }}
            />
          </div>
          {completeness.missing.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Still needed: {completeness.missing.join(' · ')}
            </p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            disabled={!profile && tab.key !== 'profile'}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Profile ─────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          {!profile ? (
            // First-time creation form
            <form onSubmit={createForm.handleSubmit(handleCreateProfile)} className="space-y-5">
              <h2 className="font-semibold text-slate-900">Create your business profile</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Business name <span className="text-red-500">*</span>
                </label>
                <input
                  {...createForm.register('businessName')}
                  placeholder="Al Rashid Auto Rentals"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {createForm.formState.errors.businessName && (
                  <p className="mt-1 text-xs text-destructive">
                    {createForm.formState.errors.businessName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  {...createForm.register('businessDescription')}
                  placeholder="Tell customers about your fleet and services..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
              >
                {isCreating ? 'Creating...' : 'Create profile & continue'}
              </button>
            </form>
          ) : (
            // Edit existing profile
            <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-5">
              <h2 className="font-semibold text-slate-900">Business information</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Business name <span className="text-red-500">*</span>
                </label>
                <input
                  {...profileForm.register('businessName')}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {profileForm.formState.errors.businessName && (
                  <p className="mt-1 text-xs text-destructive">
                    {profileForm.formState.errors.businessName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  {...profileForm.register('businessDescription')}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Logo + Banner */}
              <div className="grid grid-cols-2 gap-4">
                <ImageUpload
                  context="provider_logo"
                  currentUrl={profile.logoUrl}
                  onUploaded={(url) => handleLogoUpload(url)}
                  label="Logo"
                  aspectRatio="square"
                />
                <ImageUpload
                  context="provider_banner"
                  currentUrl={profile.bannerUrl}
                  onUploaded={(url) => handleBannerUpload(url)}
                  label="Banner"
                  aspectRatio="wide"
                />
              </div>

              <button
                type="submit"
                disabled={updateProvider.isPending}
                className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
              >
                {updateProvider.isPending ? 'Saving...' : 'Save & continue'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* ── Tab: Showroom ────────────────────────────────────────────────── */}
      {activeTab === 'showroom' && (() => {
        const existingShowroom = profile?.showrooms?.[0];

        if (existingShowroom && !editingShowroom) {
          return (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="font-semibold text-slate-900">Your showroom</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        showroomForm.reset({
                          name: existingShowroom.name,
                          address: existingShowroom.address,
                          city: existingShowroom.city,
                          area: existingShowroom.area ?? '',
                          contactNumber: existingShowroom.contactNumber,
                          whatsappNumber: existingShowroom.whatsappNumber ?? '',
                        });
                        setEditingShowroom(true);
                      }}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteShowroom.mutate(existingShowroom.id)}
                      disabled={deleteShowroom.isPending}
                      className="text-sm text-slate-400 hover:text-destructive transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</dt>
                    <dd className="mt-0.5 text-slate-900">{existingShowroom.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">City</dt>
                    <dd className="mt-0.5 text-slate-900 capitalize">{existingShowroom.city}{existingShowroom.area ? `, ${existingShowroom.area}` : ''}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</dt>
                    <dd className="mt-0.5 text-slate-900">{existingShowroom.address}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contact</dt>
                    <dd className="mt-0.5 text-slate-900">{existingShowroom.contactNumber}</dd>
                  </div>
                  {existingShowroom.whatsappNumber && (
                    <div>
                      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">WhatsApp</dt>
                      <dd className="mt-0.5 text-slate-900">{existingShowroom.whatsappNumber}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition"
              >
                Continue to documents →
              </button>
            </div>
          );
        }

        const isEditing = !!existingShowroom && editingShowroom;
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-900">
                {isEditing ? 'Edit showroom' : 'Add your showroom'}
              </h2>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setEditingShowroom(false)}
                  className="text-sm text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>
            <form
              onSubmit={showroomForm.handleSubmit(isEditing ? handleUpdateShowroom : handleAddShowroom)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Showroom name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...showroomForm.register('name')}
                    placeholder="Capital Auto — Lahore"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {showroomForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-destructive">{showroomForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...showroomForm.register('city')}
                    placeholder="Lahore"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {showroomForm.formState.errors.city && (
                    <p className="mt-1 text-xs text-destructive">{showroomForm.formState.errors.city.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  {...showroomForm.register('address')}
                  placeholder="Shop 12, Main Boulevard, Gulberg"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {showroomForm.formState.errors.address && (
                  <p className="mt-1 text-xs text-destructive">{showroomForm.formState.errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Area / neighbourhood</label>
                <input
                  {...showroomForm.register('area')}
                  placeholder="Gulberg III"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Contact number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...showroomForm.register('contactNumber')}
                    placeholder="+92 300 1234567"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {showroomForm.formState.errors.contactNumber && (
                    <p className="mt-1 text-xs text-destructive">{showroomForm.formState.errors.contactNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp number</label>
                  <input
                    {...showroomForm.register('whatsappNumber')}
                    placeholder="+92 300 1234567"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createShowroom.isPending || updateShowroom.isPending}
                className="bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
              >
                {createShowroom.isPending || updateShowroom.isPending
                  ? 'Saving...'
                  : isEditing ? 'Save changes' : 'Add showroom'}
              </button>
            </form>
          </div>
        );
      })()}

      {/* ── Tab: Documents ───────────────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Verification documents</h2>
          <p className="text-sm text-slate-500 mb-5">
            Upload your business license and any supporting documents. All documents are reviewed privately by our admin team.
          </p>

          <DocumentUpload
            existingDocuments={profile?.documents ?? []}
            onUploaded={handleDocumentUploaded}
          />

          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className="mt-5 bg-primary text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-primary/90 transition"
          >
            Continue to submit →
          </button>
        </div>
      )}

      {/* ── Tab: Submit ──────────────────────────────────────────────────── */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Submit for review</h2>
          <p className="text-sm text-slate-500 mb-6">
            Once submitted, our admin team will review your profile within 1–2 business days. You'll be notified by email when approved.
          </p>

          {/* Checklist */}
          <div className="space-y-2.5 mb-6">
            {[
              { label: 'Business name', pass: !!profile?.businessName },
              { label: 'Description', pass: !!profile?.businessDescription },
              { label: 'Logo uploaded', pass: !!profile?.logoUrl },
              { label: 'At least one showroom', pass: (profile?.showrooms ?? []).length > 0 },
              { label: 'At least one document', pass: (profile?.documents ?? []).length > 0 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.pass ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}
                >
                  {item.pass ? (
                    <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                  )}
                </div>
                <span className={`text-sm ${item.pass ? 'text-slate-800' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {isAlreadySubmitted ? (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
              {profile?.verificationStatus === 'APPROVED'
                ? '🎉 Your profile is approved! You can now list vehicles.'
                : '⏳ Your profile is currently under review. We\'ll email you when complete.'}
            </div>
          ) : (
            <button
              onClick={handleSubmitForReview}
              disabled={!canSubmit || submitForReview.isPending}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitForReview.isPending
                ? 'Submitting...'
                : canSubmit
                ? 'Submit for review'
                : `Complete profile first (${completeness?.score ?? 0}% / 60% required)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
