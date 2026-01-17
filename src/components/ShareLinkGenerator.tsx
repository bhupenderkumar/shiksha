import React, { useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Link2, Clock, Eye, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  shareableLinkService,
  generateShareUrl,
  generateWhatsAppShareUrl,
  ShareableLink,
} from '@/services/shareableLinkService';
import { useAuth } from '@/lib/auth-provider';

interface ShareLinkGeneratorProps {
  contentType: 'homework' | 'classwork';
  contentId: string;
  title: string;
  date: string;
  className?: string;
  subjectName?: string;
  existingLinks?: ShareableLink[];
  onLinkCreated?: (link: ShareableLink) => void;
  onLinkDeleted?: (linkId: string) => void;
}

export const ShareLinkGenerator: React.FC<ShareLinkGeneratorProps> = ({
  contentType,
  contentId,
  title,
  date,
  className,
  subjectName,
  existingLinks = [],
  onLinkCreated,
  onLinkDeleted,
}) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expiryDays, setExpiryDays] = useState<number | ''>('');

  const handleCreateLink = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to create a shareable link');
      return;
    }

    setIsCreating(true);
    try {
      const expiresAt = expiryDays
        ? new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const link = await shareableLinkService.createShareableLink(
        {
          content_type: contentType,
          content_id: contentId,
          expires_at: expiresAt,
        },
        user.id
      );

      toast.success('Share link created successfully!');
      onLinkCreated?.(link);
      setShowCreateDialog(false);
      setExpiryDays('');
    } catch (error) {
      console.error('Error creating share link:', error);
      toast.error('Failed to create share link');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async (token: string) => {
    const url = generateShareUrl(token, contentType);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(token);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShareWhatsApp = (token: string) => {
    const shareUrl = generateShareUrl(token, contentType);
    const whatsappUrl = generateWhatsAppShareUrl(shareUrl, title, date, className, subjectName);
    window.open(whatsappUrl, '_blank');
  };

  const handleNativeShare = async (token: string) => {
    const shareUrl = generateShareUrl(token, contentType);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - ${contentType === 'homework' ? 'Homework' : 'Classwork'}`,
          text: `View ${contentType} for ${className || 'class'}: ${title}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          handleCopyLink(token);
        }
      }
    } else {
      handleCopyLink(token);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await shareableLinkService.deleteLink(linkId);
      toast.success('Share link deleted');
      onLinkDeleted?.(linkId);
    } catch (error) {
      toast.error('Failed to delete share link');
    }
  };

  const handleDeactivateLink = async (linkId: string) => {
    try {
      await shareableLinkService.deactivateLink(linkId);
      toast.success('Share link deactivated');
      onLinkDeleted?.(linkId);
    } catch (error) {
      toast.error('Failed to deactivate share link');
    }
  };

  const activeLinks = existingLinks.filter(
    (link) => link.is_active && (!link.expires_at || new Date(link.expires_at) > new Date())
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-600" />
            Share with Parents
          </CardTitle>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2">
                <Link2 className="w-4 h-4" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Shareable Link</DialogTitle>
                <DialogDescription>
                  Create a link that parents can use to view this {contentType} without logging in.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Link expiry (optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="expiry"
                      type="number"
                      min="1"
                      max="365"
                      placeholder="No expiry"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty for a permanent link
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLink}
                  disabled={isCreating}
                  className="gap-2"
                >
                  {isCreating ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Create Link
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {activeLinks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active share links</p>
            <p className="text-xs mt-1">Create a link to share with parents via WhatsApp</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLinks.map((link) => (
              <div
                key={link.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-muted/50 border"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs bg-background px-2 py-1 rounded border truncate max-w-[180px] sm:max-w-[250px]">
                      {generateShareUrl(link.token, contentType)}
                    </code>
                    {link.expires_at && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Clock className="w-3 h-3" />
                        Expires {format(new Date(link.expires_at), 'MMM d')}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {link.view_count} views
                    </span>
                    <span>
                      Created {format(new Date(link.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyLink(link.token)}
                    className="gap-1"
                  >
                    {copied === link.token ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleShareWhatsApp(link.token)}
                    className="gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </Button>
                  
                  {'share' in navigator && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNativeShare(link.token)}
                      className="gap-1"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDeactivateLink(link.id)}>
                        <Clock className="w-4 h-4 mr-2" />
                        Deactivate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteLink(link.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShareLinkGenerator;
