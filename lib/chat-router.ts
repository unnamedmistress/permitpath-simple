import { ChatMessage, IntentType, Permit, Prediction } from '@/types';

function classifyIntent(text: string): IntentType {
  const lower = text.toLowerCase();
  if (lower.includes('status') || lower.includes('where is my permit')) return 'STATUS_CHECK';
  if (lower.includes('document') || lower.includes('checklist') || lower.includes('paperwork')) return 'DOCUMENT_HELP';
  if (lower.includes('permit') || lower.includes('build') || lower.includes('install')) return 'PERMIT_INQUIRY';
  return 'GENERAL';
}

export function routeChatMessage(input: string, permits: Permit[], predictions: Prediction[]): ChatMessage {
  const intent = classifyIntent(input);
  const now = new Date().toISOString();

  if (intent === 'STATUS_CHECK') {
    const active = permits.find((item) => item.status !== 'APPROVED') ?? permits[0];
    if (!active) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'No permits found yet. Create one from the dashboard and I can track it.',
        timestamp: now,
      };
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `Current status for \"${active.title}\" is ${active.status}. Estimated remaining days: ${active.estimatedDays}.`,
      timestamp: now,
      actions: [{ label: 'View Permit', type: 'STATUS_CHECK', payload: { permitId: active.id } }],
    };
  }

  if (intent === 'DOCUMENT_HELP') {
    const topPrediction = predictions[0];
    if (!topPrediction) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'I do not have a prediction yet. Run project analysis first to generate a checklist.',
        timestamp: now,
      };
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `For ${topPrediction.permitType}, start with: ${topPrediction.requiredDocs.join(', ')}.`,
      timestamp: now,
      actions: [{ label: 'Use Checklist', type: 'VIEW_CHECKLIST', payload: { predictionId: topPrediction.id } }],
    };
  }

  if (intent === 'PERMIT_INQUIRY') {
    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content:
        'Describe your project with scope, size, and location. I will map it to likely permit types and generate required documents.',
      timestamp: now,
    };
  }

  return {
    id: `msg_${Date.now()}`,
    role: 'assistant',
    content: 'I can help with permit predictions, status tracking, and document checklists.',
    timestamp: now,
  };
}
