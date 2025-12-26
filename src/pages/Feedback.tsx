import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { feedbackService, type Feedback as FeedbackType, type FeedbackReply } from '@/services/feedbackService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageSquare, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { EmptyState } from '@/components/ui/empty-state';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

export default function Feedback() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [note, setNote] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);
    const [reply, setReply] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const loadFeedbacks = async () => {
        if (!user) return;

        try {
            setIsLoading(true);
            const data = user.role === 'PARENT'
                ? await feedbackService.getByUserId(user.id)
                : await feedbackService.getAll();
            setFeedbacks(data);
        } catch (error) {
            console.error('Error loading feedbacks:', error);
            toast.error("Failed to load feedbacks. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFeedbacks();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setIsLoading(true);
            await feedbackService.create(user.id, title, description, note);
            setTitle('');
            setDescription('');
            setNote('');
            toast.success("Feedback submitted successfully.");
            loadFeedbacks();
            setShowForm(false);
        } catch (error) {
            console.error('Error creating feedback:', error);
            toast.error("Failed to submit feedback. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async (feedbackId: number) => {
        if (!user || !reply.trim()) return;

        try {
            setIsLoading(true);
            await feedbackService.addReply(feedbackId, user.id, reply);
            setReply('');
            toast.success("Reply added successfully.");
            const updatedFeedback = await feedbackService.getById(feedbackId);
            setSelectedFeedback(updatedFeedback);
            loadFeedbacks();
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error("Failed to add reply. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (feedbackId: number, newStatus: 'RAISED' | 'RESOLVED') => {
        try {
            setIsLoading(true);
            await feedbackService.updateStatus(feedbackId, newStatus);
            toast.success(`Feedback marked as ${newStatus.toLowerCase()}.`);
            loadFeedbacks();
            if (selectedFeedback?.id === feedbackId) {
                const updatedFeedback = await feedbackService.getById(feedbackId);
                setSelectedFeedback(updatedFeedback);
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error("Failed to update status. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const viewFeedbackDetails = async (feedbackId: number) => {
        try {
            setIsLoading(true);
            const feedback = await feedbackService.getById(feedbackId);
            setSelectedFeedback(feedback);
        } catch (error) {
            console.error('Error loading feedback details:', error);
            toast.error("Failed to load feedback details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-4">
            <h1 className="text-3xl font-bold mb-6 text-center text-foreground">Feedback System</h1>


                <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                        <Button>Submit New Feedback</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Submit New Feedback</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Input
                                    placeholder="Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Textarea
                                    placeholder="Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    className="min-h-[100px]"
                                    disabled={isLoading}
                                />
                            </div>
                            <div>
                                <Textarea
                                    placeholder="Additional Notes (Optional)"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="min-h-[60px]"
                                    disabled={isLoading}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    Submit Feedback
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>


            <div className="grid gap-4">
                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : feedbacks.length === 0 ? (
                    <EmptyState
                        title="No feedbacks found"
                        description="There are no feedbacks available at the moment."
                        icon={<MessageSquare className="w-12 h-12 text-gray-400" />}
                    />
                ) : (
                    feedbacks.map((feedback) => (
                        <Card key={feedback.id} className="p-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold">{feedback.title}</h3>
                                        <span className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${
                                            feedback.status === 'RESOLVED'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                                        }`}>
                                            {feedback.status === 'RESOLVED' ? (
                                                <CheckCircle2 className="w-4 h-4" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4" />
                                            )}
                                            {feedback.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        By {feedback.user?.email || 'Unknown User'} ({feedback.user?.role?.toLowerCase() || 'N/A'})
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {format(new Date(feedback.created_at), 'PPpp')}
                                    </p>
                                    <Dialog open={showDetails && selectedFeedback?.id === feedback.id}
                                           onOpenChange={(open) => {
                                               setShowDetails(open);
                                               if (!open) setSelectedFeedback(null);
                                           }}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="mt-2"
                                                onClick={() => setSelectedFeedback(feedback)}
                                            >
                                                View Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Feedback Details</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{feedback.title}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        By {feedback.user?.email || 'Unknown User'} ({feedback.user?.role?.toLowerCase() || 'N/A'})
                                                    </p>
                                                    <p className="text-sm text-gray-600 mb-4">
                                                        {format(new Date(feedback.created_at), 'PPpp')}
                                                    </p>
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <p className="whitespace-pre-wrap">{feedback.description}</p>
                                                        {feedback.note && (
                                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                                <p className="text-sm font-medium text-gray-500">Additional Notes:</p>
                                                                <p className="mt-1 text-gray-600 whitespace-pre-wrap">{feedback.note}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant={feedback.status === 'RESOLVED' ? 'destructive' : 'default'}
                                                            onClick={() => handleStatusChange(
                                                                feedback.id,
                                                                feedback.status === 'RESOLVED' ? 'RAISED' : 'RESOLVED'
                                                            )}
                                                            disabled={isLoading}
                                                        >
                                                            Mark as {feedback.status === 'RESOLVED' ? 'Raised' : 'Resolved'}
                                                        </Button>
                                                    </div>
                                                )}

                                                <div className="pt-4 border-t">
                                                    <h4 className="font-semibold mb-4">Replies</h4>
                                                    <div className="space-y-4">
                                                        {!feedback.replies || feedback.replies.length === 0 ? (
                                                            <p className="text-gray-500 text-center py-4">No replies yet</p>
                                                        ) : (
                                                            feedback.replies.map((reply) => (
                                                                <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
                                                                    <p className="whitespace-pre-wrap">{reply.reply}</p>
                                                                    <div className="mt-2 text-sm text-gray-600">
                                                                        <p>By {reply.user?.email || 'Unknown User'}</p>
                                                                        <p>{format(new Date(reply.created_at), 'PPpp')}</p>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
                                                        <div className="mt-4">
                                                            <div className="flex items-center gap-2">
                                                                <Textarea
                                                                    value={reply}
                                                                    onChange={(e) => setReply(e.target.value)}
                                                                    placeholder="Type your reply..."
                                                                    className="flex-1"
                                                                    disabled={isLoading}
                                                                />
                                                                <Button
                                                                    onClick={() => handleReply(feedback.id)}
                                                                    disabled={!reply.trim() || isLoading}
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
