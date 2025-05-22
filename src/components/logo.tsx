import { Clock } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Clock className="h-8 w-8" />
      <h1 className="text-2xl font-bold">TimeSage</h1>
    </div>
  );
}
