'use client';

import { TripInquiryInbox } from '../../../../components/trips/TripInquiryInbox';

export default function ProviderIncomingRequestsPage() {
  return <TripInquiryInbox tripBasePath="/provider/trips" />;
}
