// AI Auto-Tagging System for Thought Capture
// Automatically categorizes entries based on keyword analysis

export const TAG_CATEGORIES = {
    FINANCE: {
        keywords: ['finance', 'financial', 'budget', 'revenue', 'profit', 'loss', 'cost', 'expense', 'income', 'money', 'cash', 'payment', 'invoice', 'accounting', 'tax', 'investment', 'funding', 'salary', 'payroll', 'pricing', 'fee', 'charge', 'billing'],
        color: '#10b981', // emerald
        icon: 'dollar'
    },
    MARKETING: {
        keywords: ['marketing', 'campaign', 'advertising', 'promo', 'brand', 'social media', 'content', 'seo', 'lead', 'conversion', 'funnel', 'ads', 'promotion', 'publicity', 'outreach', 'newsletter', 'email', 'launch'],
        color: '#f59e0b', // amber
        icon: 'megaphone'
    },
    SALES: {
        keywords: ['sales', 'demo', 'client', 'customer', 'prospect', 'deal', 'pipeline', 'quota', 'target', 'revenue', 'closing', 'negotiation', 'contract', 'proposal', 'crm', 'lead', 'opportunity'],
        color: '#3b82f6', // blue
        icon: 'trending'
    },
    OPERATIONS: {
        keywords: ['operations', 'process', 'workflow', 'system', 'automation', 'procedure', 'policy', 'protocol', 'infrastructure', 'logistics', 'supply', 'inventory', 'resource', 'efficiency', 'optimization'],
        color: '#6366f1', // indigo
        icon: 'settings'
    },
    PRODUCT: {
        keywords: ['product', 'feature', 'development', 'design', 'ux', 'ui', 'user experience', 'roadmap', 'release', 'version', 'update', 'improvement', 'enhancement', 'functionality', 'specification'],
        color: '#8b5cf6', // violet
        icon: 'box'
    },
    HR: {
        keywords: ['staff', 'employee', 'hiring', 'recruitment', 'training', 'onboarding', 'performance', 'review', 'benefit', 'culture', 'team', 'workforce', 'talent', 'retention', 'morale', 'conflict', 'vacation', 'leave'],
        color: '#ec4899', // pink
        icon: 'users'
    },
    STRATEGY: {
        keywords: ['strategy', 'strategic', 'vision', 'mission', 'goal', 'objective', 'plan', 'initiative', 'expansion', 'growth', 'scaling', 'market', 'competition', 'advantage', 'positioning', 'direction'],
        color: '#f97316', // orange
        icon: 'target'
    },
    TECHNOLOGY: {
        keywords: ['tech', 'software', 'hardware', 'app', 'application', 'platform', 'database', 'api', 'integration', 'security', 'bug', 'fix', 'update', 'maintenance', 'server', 'cloud', 'data'],
        color: '#06b6d4', // cyan
        icon: 'code'
    },
    MEETING: {
        keywords: ['meeting', 'call', 'discussion', 'conference', 'standup', 'sync', 'review', 'retrospective', 'planning', 'alignment', 'catchup', 'checkin', 'one-on-one', '1:1'],
        color: '#14b8a6', // teal
        icon: 'calendar'
    },
    URGENT: {
        keywords: ['urgent', 'asap', 'emergency', 'critical', 'immediate', 'now', 'deadline', 'overdue', 'blocking', 'escalation', 'priority', 'important'],
        color: '#ef4444', // red
        icon: 'alert'
    }
};

export type TagCategory = keyof typeof TAG_CATEGORIES;

/**
 * Analyzes content and returns relevant tags based on keyword matching
 * Also returns confidence scores for each tag
 */
export function autoTagContent(content: string, title?: string): { tags: TagCategory[]; confidence: Record<string, number> } {
    const text = `${title || ''} ${content}`.toLowerCase();
    const words = text.split(/\s+/);
    const scores: Record<string, number> = {};
    
    // Calculate scores for each category
    Object.entries(TAG_CATEGORIES).forEach(([category, data]) => {
        let score = 0;
        data.keywords.forEach(keyword => {
            // Check for exact matches (higher weight)
            if (text.includes(keyword.toLowerCase())) {
                score += 2;
            }
            // Check for partial matches (lower weight)
            words.forEach(word => {
                if (word.length > 3 && keyword.toLowerCase().includes(word)) {
                    score += 0.5;
                }
            });
        });
        scores[category] = score;
    });
    
    // Get categories with scores above threshold
    const threshold = 1;
    const relevantTags = Object.entries(scores)
        .filter(([_, score]) => score >= threshold)
        .sort((a, b) => b[1] - a[1]) // Sort by score descending
        .slice(0, 3) // Max 3 tags
        .map(([category]) => category as TagCategory);
    
    // If no tags found, default to STRATEGY
    if (relevantTags.length === 0) {
        relevantTags.push('STRATEGY');
    }
    
    return { tags: relevantTags, confidence: scores };
}

/**
 * Get tag metadata (color, icon) for a category
 */
export function getTagMetadata(category: TagCategory) {
    return TAG_CATEGORIES[category] || { color: '#6b7280', icon: 'tag' };
}

/**
 * Format tag for display
 */
export function formatTag(category: TagCategory): string {
    return category.charAt(0) + category.slice(1).toLowerCase();
}
