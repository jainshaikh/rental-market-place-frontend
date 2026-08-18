'use client';

import { MyTripDetail } from '../../../../../components/trips/MyTripDetail';

export default function DashboardTripDetailPage() {
  return <MyTripDetail backHref="/dashboard/trips" vehicleBasePath="/dashboard/my-vehicles" />;
}
