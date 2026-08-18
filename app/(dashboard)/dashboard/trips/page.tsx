'use client';

import { MyTripsList } from '../../../../components/trips/MyTripsList';

export default function DashboardTripsPage() {
  return <MyTripsList basePath="/dashboard/trips" newHref="/dashboard/trips/new" />;
}
