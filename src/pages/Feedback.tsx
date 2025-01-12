import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { feedbackService } from '@/services/feedbackService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { MessageSquare, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function Feedback() {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [note, setNote] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [reply, setReply] = useState('');

    const loadFeedbacks = async () => {
        try {
            const data = user?.role === 'PARENT' 
                ? await feedbackService.getByUserId(user.id)
                : await feedbackService.getAll();
            setFeedbacks(data);
        } catch (error) {
            console.error('Error loading feedbacks:', error);
        }
    };

    useEffect(() => {
        loadFeedbacks();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await feedbackService.create(user.id, title, description, note);
            setTitle('');
            setDescription('');
            setNote('');
            loadFeedbacks();
        } catch (error) {
            console.error('Error creating feedback:', error);
        }
    };

    const handleReply = async (feedbackId) => {
        try {
            await feedbackService.addReply(feedbackId, user.id, reply);
            setReply('');
            loadFeedbacks();
            const updatedFeedback = await feedbackService.getById(feedbackId);
            setSelectedFeedback(updatedFeedback);
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    const handleStatusChange = async (feedbackId, newStatus) => {
        try {
            await feedbackService.updateStatus(feedbackId, newStatus);
            loadFeedbacks();
            if (selectedFeedback?.id === feedbackId) {
                const updatedFeedback = await feedbackService.getById(feedbackId);
                setSelectedFeedback(updatedFeedback);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const viewFeedbackDetails = async (feedbackId) => {
        try {
            const feedback = await feedbackService.getById(feedbackId);
            setSelectedFeedback(feedback);
        } catch (error) {
            console.error('Error loading feedback details:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Feedback System</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    {user?.role === 'PARENT' && (
                        <Card className="p-4 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Submit New Feedback</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <Textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Additional Notes</label>
                                    <Textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>
                                <Button type="submit">Submit Feedback</Button>
                            </form>
                        </Card>
                    )}

                    <div className="space-y-4">
                        {feedbacks?.map((feedback) => (
                            <Card
                                key={feedback.id}
                                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => viewFeedbackDetails(feedback.id)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{feedback.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            {format(new Date(feedback.created_at), 'PPpp')}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-sm ${
                                        feedback.status === 'RESOLVED' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {feedback.status}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {selectedFeedback && (
                    <Card className="p-4">
                        <h2 className="text-xl font-semibold mb-4">Feedback Details</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">{selectedFeedback.title}</h3>
                                <p className="text-sm text-gray-600">
                                    {format(new Date(selectedFeedback.created_at), 'PPpp')}
                                </p>
                                <p className="mt-2">{selectedFeedback.description}</p>
                                {selectedFeedback.note && (
                                    <p className="mt-2 text-gray-600">{selectedFeedback.note}</p>
                                )}
                            </div>

                            {selectedFeedback.replies?.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">Replies</h4>
                                    <div className="space-y-2">
                                        {selectedFeedback.replies.map((reply) => (
                                            <div key={reply.id} className="bg-gray-50 p-3 rounded">
                                                <p>{reply.reply}</p>
                                                <p className="text-sm text-gray-600">
                                                    {reply.user_name} ({reply.user_role.toLowerCase()}) - 
                                                    {format(new Date(reply.created_at), 'PPpp')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Textarea
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="flex-1"
                                        />
                                        <Button
                                            onClick={() => handleReply(selectedFeedback.id)}
                                            disabled={!reply.trim()}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {user?.role === 'PARENT' && selectedFeedback.status === 'RESOLVED' && (
                                <Button
                                    onClick={() => handleStatusChange(selectedFeedback.id, 'RAISED')}
                                    variant="outline"
                                >
                                    Reopen Feedback
                                </Button>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
