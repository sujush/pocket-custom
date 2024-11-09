// pages/cargo-location.tsx
import CargoLocation from "@/components/CargoLocation"
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CargoLocationPage() {
  return (
    <ProtectedRoute>
      <CargoLocation />
    </ProtectedRoute>
  );
}
