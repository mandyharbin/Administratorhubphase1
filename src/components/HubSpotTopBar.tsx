import { Bell, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import navLogoImage from 'figma:asset/a0c8ed220948fd94661ca373d1b4d8f518fe1d2b.png';

interface HubSpotTopBarProps {
  userName?: string;
  userInitials?: string;
  onUserClick?: () => void;
}

export function HubSpotTopBar({ userName = 'Clinical User', userInitials = 'CU', onUserClick }: HubSpotTopBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <img src={navLogoImage} alt="Logo" className="h-8" />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm">
          <Bell className="w-5 h-5" />
        </Button>
        
        <button
          onClick={onUserClick}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{userInitials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-900">{userName}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
