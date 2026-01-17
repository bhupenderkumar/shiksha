import React, { useState } from 'react';
import { MessageCircle, Send, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { contentQueryService, ContentQuery } from '@/services/shareableLinkService';
import { QueryList } from '@/components/shared/QueryList';

interface QuerySectionProps {
  shareableLinkId: string;
  queries: ContentQuery[];
  onQuerySubmitted?: (query: ContentQuery) => void;
  isPublicView?: boolean;
  className?: string;
}

export const QuerySection: React.FC<QuerySectionProps> = ({
  shareableLinkId,
  queries,
  onQuerySubmitted,
  isPublicView = true,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedQueries, setExpandedQueries] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    parentName: '',
    parentPhone: '',
    questionText: '',
  });

  const toggleQueryExpanded = (queryId: string) => {
    setExpandedQueries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(queryId)) {
        newSet.delete(queryId);
      } else {
        newSet.add(queryId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.parentName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!formData.questionText.trim()) {
      toast.error('Please enter your question');
      return;
    }

    setIsSubmitting(true);
    try {
      const query = await contentQueryService.createQuery({
        shareable_link_id: shareableLinkId,
        parent_name: formData.parentName.trim(),
        parent_phone: formData.parentPhone.trim() || undefined,
        question_text: formData.questionText.trim(),
      });

      toast.success('Your question has been submitted!');
      onQuerySubmitted?.(query);
      setFormData({ parentName: '', parentPhone: '', questionText: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error('Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            Questions & Answers
            {queries.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {queries.length}
              </Badge>
            )}
          </CardTitle>

          {isPublicView && !showForm && (
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Ask Question
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="parentName" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Your Name *
                </Label>
                <Input
                  id="parentName"
                  placeholder="Enter your name"
                  value={formData.parentName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, parentName: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone" className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Phone (optional)
                </Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="For follow-up"
                  value={formData.parentPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, parentPhone: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionText">Your Question *</Label>
              <Textarea
                id="questionText"
                placeholder="Type your question about this homework/classwork..."
                value={formData.questionText}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, questionText: e.target.value }))
                }
                rows={3}
                required
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ parentName: '', parentPhone: '', questionText: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Question
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Questions List - Using shared QueryList component */}
        <QueryList
          queries={queries}
          expandedQueries={expandedQueries}
          onToggleQuery={toggleQueryExpanded}
          emptyMessage="No questions yet"
          emptySubMessage="Be the first to ask a question!"
        />
      </CardContent>
    </Card>
  );
};

export default QuerySection;
