import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  History, 
  Eye, 
  RotateCcw, 
  CheckCircle2,
  Clock,
  GitBranch
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: any;
}

export function VersionHistoryDialog({ open, onOpenChange, asset }: VersionHistoryDialogProps) {
  if (!asset) return null;

  // Mock version history data
  const versionHistory = [
    {
      version: asset.version,
      status: asset.status,
      date: asset.lastModified,
      author: asset.modifiedBy,
      changes: 'Updated question validation rules and added new conditional logic',
      isCurrent: true
    },
    {
      version: '1.1.0',
      status: 'active',
      date: 'November 10, 2025',
      author: 'Sarah Chen',
      changes: 'Added 3 new questions for medication history',
      isCurrent: false
    },
    {
      version: '1.0.0',
      status: 'active',
      date: 'October 15, 2025',
      author: 'Michael Torres',
      changes: 'Initial publication',
      isCurrent: false
    },
    {
      version: '0.5.0',
      status: 'draft',
      date: 'October 10, 2025',
      author: 'Sarah Chen',
      changes: 'Beta version for internal testing',
      isCurrent: false
    },
  ];

  const handleRestore = (version: string) => {
    toast.success(`Restored to version ${version}`);
    onOpenChange(false);
  };

  const handleView = (version: string) => {
    toast.info(`Viewing version ${version}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-amber-100 text-amber-700';
      case 'retired': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-gray-600" />
            <div>
              <DialogTitle>Version History</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">{asset.name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-4 py-4">
            {versionHistory.map((version, index) => (
              <div
                key={version.version}
                className={`relative pl-8 pb-4 ${
                  index !== versionHistory.length - 1 ? 'border-l-2 border-gray-200' : ''
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#007CBE] flex items-center justify-center">
                  {version.isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-[#007CBE]" />
                  )}
                </div>

                {/* Version card */}
                <div className={`rounded-lg border p-4 ${
                  version.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        v{version.version}
                      </Badge>
                      <Badge className={getStatusColor(version.status)}>
                        {version.status}
                      </Badge>
                      {version.isCurrent && (
                        <Badge className="bg-[#007CBE] text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(version.version)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {!version.isCurrent && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(version.version)}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900">{version.changes}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {version.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {version.author}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            {versionHistory.length} versions available
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}