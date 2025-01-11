import { supabase } from "@/lib/api-client";

export interface Feedback {
    id: number;
    user_id: number;
    title: string;
    description: string;
    note?: string;
    status: 'RAISED' | 'RESOLVED';
    created_at: Date;
    updated_at: Date;
}

export interface FeedbackReply {
    id: number;
    feedback_id: number;
    user_id: number;
    reply: string;
    created_at: Date;
}

export const feedbackService = {
    // Create new feedback
    async create(userId: number, title: string, description: string, note?: string) {
        return await supabase.schema('school').from('feedback').insert([{ user_id: userId, title, description, note }])
        .select();
    },

    // Get all feedback (for admin/teacher)
    async getAll() {
        return await supabase.schema('school').from('feedback').select(`*`);
    },

    // Get feedback by user ID (for parents)
    async getByUserId(userId: number) {
        return await supabase.schema('school').from('feedback').select(`*`)
    },

    // Get feedback by ID with replies
    async getById(id: number) {
        const feedback = await db.one('SELECT * FROM school.feedback WHERE id = $1', [id]);
        const replies = await db.manyOrNone(`
            SELECT r.*, u.name as user_name, u.role as user_role 
            FROM school.feedback_replies r
            JOIN school.users u ON r.user_id = u.id
            WHERE feedback_id = $1 
            ORDER BY created_at ASC
        `, [id]);
        return { ...feedback, replies };
    },

    // Update feedback status
    async updateStatus(id: number, status: 'RAISED' | 'RESOLVED') {
        return await db.one(
            'UPDATE school.feedback SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
    },

    // Add reply
    async addReply(feedbackId: number, userId: number, reply: string) {
        const feedbackReply = await db.one(
            'INSERT INTO school.feedback_replies (feedback_id, user_id, reply) VALUES ($1, $2, $3) RETURNING *',
            [feedbackId, userId, reply]
        );
        // Update feedback status to RESOLVED when reply is added
        await db.none(
            'UPDATE school.feedback SET status = $1 WHERE id = $2',
            ['RESOLVED', feedbackId]
        );
        return feedbackReply;
    },

    // Get replies for a feedback
    async getReplies(feedbackId: number) {
        return await db.manyOrNone(
            'SELECT * FROM school.feedback_replies WHERE feedback_id = $1 ORDER BY created_at ASC',
            [feedbackId]
        );
    }
};
