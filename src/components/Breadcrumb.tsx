import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  currentPage: string;
  onHomeClick: () => void;
}

export function Breadcrumb({ currentPage, onHomeClick }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm mb-6">
      <button 
        onClick={onHomeClick}
        className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>
      <ChevronRight className="w-4 h-4 text-gray-400" />
      <span className="text-gray-900">{currentPage}</span>
    </div>
  );
}
