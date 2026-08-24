'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { Button, Modal, WhatsAppButton } from '../ui';

interface InquiryCtaProps {
  vehicleSlug: string;
  vehicleTitle: string;
  whatsappNumber?: string | null;
}

/**
 * The vehicle detail page's "Send inquiry" CTA needs an account — but the
 * inquire page itself just silently redirects unauthenticated visitors to
 * /login with no explanation, which reads as the button being broken. This
 * catches that case here instead, explains why, and offers WhatsApp as a
 * no-account alternative right there rather than making them guess.
 */
export function InquiryCta({ vehicleSlug, vehicleTitle, whatsappNumber }: InquiryCtaProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const inquireHref = `/vehicles/${vehicleSlug}/inquire`;
  const whatsappMessage = `Hi, I'm interested in renting the ${vehicleTitle}. Could you please share more details?`;

  return (
    <>
      {isAuthenticated ? (
        <Link href={inquireHref} className="block">
          <Button variant="primary" size="lg" className="w-full">
            Send inquiry
          </Button>
        </Link>
      ) : (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
          onClick={() => setShowAuthModal(true)}
        >
          Send inquiry
        </Button>
      )}

      {whatsappNumber && (
        <WhatsAppButton phone={whatsappNumber} message={whatsappMessage} label="Chat on WhatsApp" />
      )}

      <Modal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        title="Sign in to send an inquiry"
        description="Creating an account lets the provider message you back and keeps your inquiry saved to your dashboard. It only takes a minute — or skip it and message the provider directly on WhatsApp."
      >
        <div className="space-y-2.5">
          <Link href={`/login?redirect=${inquireHref}`} className="block">
            <Button variant="primary" className="w-full">
              Sign in
            </Button>
          </Link>
          <Link href={`/register?redirect=${inquireHref}`} className="block">
            <Button variant="secondary" className="w-full">
              Create an account
            </Button>
          </Link>
          {whatsappNumber && (
            <WhatsAppButton
              phone={whatsappNumber}
              message={whatsappMessage}
              label="Chat on WhatsApp instead"
            />
          )}
        </div>
      </Modal>
    </>
  );
}
