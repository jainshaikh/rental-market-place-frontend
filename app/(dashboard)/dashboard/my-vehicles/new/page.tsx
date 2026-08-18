'use client';

import { UserVehicleForm } from '../../../../../components/user-vehicles/UserVehicleForm';

export default function NewDashboardVehiclePage() {
  return <UserVehicleForm cancelHref="/dashboard/my-vehicles" successHref="/dashboard/my-vehicles" />;
}
