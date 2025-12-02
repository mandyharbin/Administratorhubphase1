import { Building2, MessageSquare, Shield, GitBranch, BookText, Database, Mail, FileText, BellRing, BellDot, UserCheck, Smartphone, Monitor, Bot, Download, History, Route, ChevronDown, Layers, Sparkles, MessageCircle, Calendar, Presentation, ClipboardList, ListTodo, GitCompare, Boxes, FileCode } from 'lucide-react';
import { Section } from '../types/section';
import { useState } from 'react';

interface SidebarProps {
  activeSection: Section | null;
  onSectionChange: (section: Section | null) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [referencesExpanded, setReferencesExpanded] = useState(true);
  const [ehrExpanded, setEhrExpanded] = useState(true);

  const navItems = [
    // Communications and Knowledge Hub section (no header)
    { id: 'notice-history' as Section, label: 'Communications', icon: History },
    { id: 'tenant-knowledge-hub' as Section, label: 'Knowledge Hub', icon: Layers },
    
    // Admin Tools section
    { id: 'form-templates' as Section, label: 'Form Templates', icon: FileCode },
    { id: 'component-library' as Section, label: 'Component Library', icon: Boxes },
    { id: 'patient-todo' as Section, label: 'Patient To-Do Lists', icon: ListTodo },
    
    // Demos section
    { id: 'demo-hub' as Section, label: 'Demo Hub', icon: Presentation },
    { id: 'fhir-data-flow' as Section, label: 'FHIR Data Flow', icon: GitCompare },
    { id: 'chart-data-source' as Section, label: 'Chart Data Source', icon: FileText },
  ];

  const ehrItems = [
    { id: 'audit' as Section, label: 'Audit Logs', icon: FileText },
    { id: 'organization' as Section, label: 'Organization & Access', icon: Building2 },
    { id: 'patient-onboarding' as Section, label: 'Patient Onboarding', icon: Download },
    { id: 'registration' as Section, label: 'Registration Management', icon: UserCheck },
    { id: 'disclaimers' as Section, label: 'Disclaimers & Consent', icon: Shield },
  ];

  const referenceItems = [
    { id: 'knowledge' as Section, label: 'Knowledge Sources', icon: Database },
    { id: 'ai-assistant-replies' as Section, label: 'AI Assistant Replies', icon: MessageSquare },
    { id: 'ai-responses' as Section, label: 'AI Auto Replies', icon: Bot },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
      <button 
        onClick={() => onSectionChange(null)}
        className="p-6 border-b border-gray-200 text-left hover:bg-gray-50 transition-colors"
      >
        <h1 className="text-blue-600">Admin Hub</h1>
      </button>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Communications & Knowledge Hub (no header) */}
        {navItems.slice(0, 2).map((item) => {
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

        {/* Admin Tools */}
        <div className="px-3 py-2 mt-4 text-xs text-gray-500 uppercase tracking-wider">
          Admin Tools
        </div>
        {navItems.slice(2, 5).map((item) => {
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

        {/* Demos */}
        <div className="px-3 py-2 mt-4 text-xs text-gray-500 uppercase tracking-wider">
          Demos
        </div>
        {navItems.slice(5, 8).map((item) => {
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

        {/* EHR */}
        <div className="px-3 py-2 mt-4 text-xs text-gray-500 uppercase tracking-wider">
          EHR
        </div>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-50"
          onClick={() => setEhrExpanded(!ehrExpanded)}
        >
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${ehrExpanded ? 'rotate-0' : '-rotate-90'}`} />
          <span className="text-sm">EHR Sections</span>
        </button>
        {ehrExpanded && ehrItems.map((item) => {
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

        {/* References */}
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
        {referencesExpanded && referenceItems.map((item) => {
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
          Version 1.0.0
        </div>
      </div>
    </aside>
  );
}