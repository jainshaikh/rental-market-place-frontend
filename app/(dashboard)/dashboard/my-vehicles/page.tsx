'use client';

import { MyVehiclesList } from '../../../../components/user-vehicles/MyVehiclesList';

export default function DashboardMyVehiclesPage() {
  return <MyVehiclesList basePath="/dashboard/my-vehicles" newHref="/dashboard/my-vehicles/new" />;
}
