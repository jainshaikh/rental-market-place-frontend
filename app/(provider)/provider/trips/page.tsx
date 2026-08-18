'use client';

import { MyTripsList } from '../../../../components/trips/MyTripsList';

export default function ProviderTripsPage() {
  return <MyTripsList basePath="/provider/trips" newHref="/provider/trips/new" />;
}
