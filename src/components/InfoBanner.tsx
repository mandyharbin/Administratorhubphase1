import { Info } from 'lucide-react';

interface InfoBannerProps {
  title: string;
  description: string;
}

export function InfoBanner({ title, description }: InfoBannerProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-blue-900 mb-1">{title}</h3>
        <p className="text-sm text-blue-800">{description}</p>
      </div>
    </div>
  );
}
