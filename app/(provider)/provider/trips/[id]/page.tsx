'use client';

import { MyTripDetail } from '../../../../../components/trips/MyTripDetail';

export default function ProviderTripDetailPage() {
  return <MyTripDetail backHref="/provider/trips" vehicleBasePath="/provider/my-vehicles" />;
}
