import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2, CheckCircle2, AlertTriangle, XCircle, Eye } from 'lucide-react';
import { aiService, type PhotoValidation } from '@/services/aiService';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AiPhotoValidatorProps {
  imageBase64: string;
  planned: {
    plannedTitle: string;
    plannedDescription: string;
    plannedWorkType: string;
    plannedChapter: string;
  };
  onValidated?: (result: PhotoValidation) => void;
  className?: string;
}

const getScoreConfig = (score: number) => {
  if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: CheckCircle2, label: 'Great Match' };
  if (score >= 50) return { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: AlertTriangle, label: 'Partial Match' };
  return { color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle, label: 'Mismatch' };
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'full_match': return { label: 'Full Match', color: 'bg-green-100 text-green-700' };
    case 'partial': return { label: 'Partial', color: 'bg-yellow-100 text-yellow-700' };
    case 'mismatch': return { label: 'Mismatch', color: 'bg-red-100 text-red-700' };
    case 'unreadable': return { label: 'Unreadable', color: 'bg-gray-100 text-gray-700' };
    default: return { label: status, color: 'bg-gray-100 text-gray-700' };
  }
};

export function AiPhotoValidator({ imageBase64, planned, onValidated, className }: AiPhotoValidatorProps) {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<PhotoValidation | null>(null);

  const handleValidate = async () => {
    setValidating(true);
    try {
      const validation = await aiService.validateWorkPhoto(imageBase64, planned);
      setResult(validation);
      onValidated?.(validation);
    } catch (error) {
      console.error('Photo validation error:', error);
      toast.error('Failed to validate photo');
    } finally {
      setValidating(false);
    }
  };

  if (!result) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleValidate}
        disabled={validating}
        className={cn("gap-2", className)}
      >
        {validating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
        {validating ? 'Analyzing...' : 'AI Validate Photo'}
      </Button>
    );
  }

  const scoreConfig = getScoreConfig(result.matchScore);
  const statusBadge = getStatusBadge(result.matchStatus);
  const ScoreIcon = scoreConfig.icon;

  return (
    <Card className={cn("border", scoreConfig.bg, className)}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px]", statusBadge.color)}>
              {statusBadge.label}
            </Badge>
            <div className={cn("flex items-center gap-1 font-bold text-lg", scoreConfig.color)}>
              <ScoreIcon className="w-5 h-5" />
              {result.matchScore}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        {result.whatPhotoShows && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Photo Shows</p>
            <p className="text-xs text-foreground">{result.whatPhotoShows}</p>
          </div>
        )}
        {result.deviationNotes && (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Deviations</p>
            <p className="text-xs text-foreground">{result.deviationNotes}</p>
          </div>
        )}
        {result.topicsCovered && result.topicsCovered.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mr-1">Topics:</span>
            {result.topicsCovered.map((topic, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] py-0">
                {topic}
              </Badge>
            ))}
          </div>
        )}
        {result.errorsSpotted && result.errorsSpotted.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">Errors Found</p>
            <ul className="text-xs text-foreground list-disc list-inside">
              {result.errorsSpotted.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        {result.suggestedFollowUp && (
          <div className="pt-1 border-t">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Follow-up</p>
            <p className="text-xs text-foreground">{result.suggestedFollowUp}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 mt-1"
          onClick={handleValidate}
          disabled={validating}
        >
          {validating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
          Re-analyze
        </Button>
      </CardContent>
    </Card>
  );
}
