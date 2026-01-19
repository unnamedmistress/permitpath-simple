import { Database } from "lucide-react";
import Button from "@/components/shared/Button";

interface SampleDataButtonProps {
  onLoadSample: () => void;
  isLoading?: boolean;
}

export default function SampleDataButton({ onLoadSample, isLoading = false }: SampleDataButtonProps) {
  return (
    <Button
      onClick={onLoadSample}
      variant="outline"
      loading={isLoading}
      icon={<Database size={18} />}
    >
      Load Sample Job
    </Button>
  );
}
