import { History, Layers, ArrowRight } from 'lucide-react';
import { Section } from '../types/section';

interface DashboardProps {
  onSectionChange: (section: Section) => void;
}

export function Dashboard({ onSectionChange }: DashboardProps) {
  const cards = [
    {
      id: 'notice-history' as Section,
      title: 'Communications',
      description: 'Manage system-wide communications and notices to patients',
      icon: History,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'tenant-knowledge-hub' as Section,
      title: 'Knowledge Hub',
      description: 'Manage knowledge base content and FAQ responses',
      icon: Layers,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Admin Hub Home</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => onSectionChange(card.id)}
              className="bg-white border border-gray-200 rounded-lg p-6 text-left hover:shadow-lg hover:border-blue-300 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${card.iconBg} ${card.iconColor} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm">{card.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
