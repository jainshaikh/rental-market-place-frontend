'use client';

import { TripInquiryInbox } from '../../../../components/trips/TripInquiryInbox';

export default function DashboardIncomingRequestsPage() {
  return <TripInquiryInbox tripBasePath="/dashboard/trips" />;
}
