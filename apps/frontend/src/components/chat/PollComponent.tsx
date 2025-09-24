'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PollOption, ChatMessage } from '@/components/modals/type';

interface PollComponentProps {
  message: ChatMessage;
  onVote: (optionIds: string[]) => Promise<void>;
  currentUserId?: string;
}

export const PollComponent: React.FC<PollComponentProps> = ({
  message,
  onVote,
  currentUserId,
}) => {
  const { t } = useTranslation();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  if (!message.poll) return null;

  const poll = message.poll;
  const question = poll.question.en || poll.question.ar;

  const handleOptionSelect = (optionId: string) => {
    if (hasVoted) return;

    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        // For single choice polls, replace the selection
        if (!poll.isMultipleChoice) {
          return [optionId];
        }
        return [...prev, optionId];
      }
    });
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0 || hasVoted) return;

    setIsVoting(true);
    try {
      await onVote(selectedOptions);
      setHasVoted(true);
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">📊</span>
        <h3 className="font-medium text-blue-900">Poll</h3>
      </div>

      <p className="text-blue-800 font-medium">{question}</p>

      <div className="space-y-2">
        {poll.options.map(option => {
          const isSelected = selectedOptions.includes(option.id);
          const optionText = option.text.en || option.text.ar;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={hasVoted}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                isSelected
                  ? 'bg-blue-100 border-blue-300 text-blue-900'
                  : 'bg-white border-blue-200 text-blue-800 hover:bg-blue-50'
              } ${hasVoted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <span>{optionText}</span>
                {isSelected && <span className="text-blue-600">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {!hasVoted && (
        <button
          onClick={handleVote}
          disabled={selectedOptions.length === 0 || isVoting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {isVoting ? 'Voting...' : 'Vote'}
        </button>
      )}

      {hasVoted && (
        <p className="text-sm text-blue-600 text-center">✓ Vote submitted</p>
      )}
    </div>
  );
};
