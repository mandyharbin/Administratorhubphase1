import { Building2, MessageSquare, Shield, GitBranch, BookText, Database, Mail, FileText, BellRing, BellDot, UserCheck, Smartphone, Monitor, Bot, Download, History, Route, ChevronDown, Layers } from 'lucide-react';
import { Section } from '../App';
import { useState } from 'react';

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [demosExpanded, setDemosExpanded] = useState(true);
  const [referencesExpanded, setReferencesExpanded] = useState(true);

  const navItems = [
    { id: 'organization' as Section, label: 'Organization & Access', icon: Building2 },
    { id: 'notice-history' as Section, label: 'Patient Notices', icon: History },
    { id: 'tenant-knowledge-hub' as Section, label: 'AI Knowledge Hub', icon: Layers },
    { id: 'ai-assistant' as Section, label: 'AI Assistant', icon: Bot },
    { id: 'patient-demo' as Section, label: 'Patient App Demo', icon: Smartphone },
    { id: 'staff-demo' as Section, label: 'Automated Healthcare Practice', icon: Monitor },
    { id: 'audit' as Section, label: 'Audit Logs', icon: FileText },
    { id: 'knowledge' as Section, label: 'Knowledge Sources', icon: Database },
    { id: 'ai-assistant-replies' as Section, label: 'AI Assistant Replies', icon: MessageSquare },
    { id: 'ai-responses' as Section, label: 'AI Auto Replies', icon: Bot },
    { id: 'disclaimers' as Section, label: 'Disclaimers & Consent', icon: Shield },
    { id: 'lexicons-routing' as Section, label: 'Lexicons & Routing', icon: Route },
    { id: 'registration' as Section, label: 'Registration Management', icon: UserCheck },
    { id: 'patient-onboarding' as Section, label: 'Patient Onboarding', icon: Download },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-blue-600">BASE Admin Hub</h1>
        <p className="text-gray-500 text-sm mt-1">Phase 1 - AI Receptionist</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
          Organization
        </div>
        {navItems.slice(0, 1).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}

        <div className="px-3 py-2 mt-4 text-xs text-gray-500 uppercase tracking-wider">
          System
        </div>
        {navItems.slice(1, 3).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}

        <div className="px-3 py-2 mt-4 text-xs text-gray-500 uppercase tracking-wider">
          Demos
        </div>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-50"
          onClick={() => setDemosExpanded(!demosExpanded)}
        >
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${demosExpanded ? 'rotate-0' : '-rotate-90'}`} />
          <span className="text-sm">Demos</span>
        </button>
        {demosExpanded && navItems.slice(3, 6).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}

        <div className="px-3 py-2 mt-4 text-xs text-gray-500 uppercase tracking-wider">
          References
        </div>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-50"
          onClick={() => setReferencesExpanded(!referencesExpanded)}
        >
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${referencesExpanded ? 'rotate-0' : '-rotate-90'}`} />
          <span className="text-sm">References</span>
        </button>
        {referencesExpanded && navItems.slice(6).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Version 1.0.0 (Phase 1)
        </div>
      </div>
    </aside>
  );
}