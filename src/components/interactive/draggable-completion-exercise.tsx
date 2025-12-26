import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { CompletionQuestion, CompletionResponse } from '@/types/interactiveAssignment';
import { DragDropContainer, Draggable, Droppable } from '@/components/ui/drag-drop-container';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { closestCenter, KeyboardSensor, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, Trash2, Volume2, Lightbulb, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { preloadSounds, playSound } from '@/lib/sound-effects';
import { triggerConfetti, triggerCompletionConfetti } from '@/lib/confetti';
import { HintButton } from '@/components/ui/hint-button';
import { v4 as uuidv4 } from 'uuid';

interface DraggableCompletionExerciseProps {
  question: {
    id: string;
    questionText: string;
    questionData: CompletionQuestion;
  };
  readOnly?: boolean;
  initialResponse?: CompletionResponse;
  onSave?: (response: CompletionResponse) => void;
  showAnswers?: boolean;
  enableSounds?: boolean;
  enableHints?: boolean;
  enableConfetti?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  hintText?: string;
}

export function DraggableCompletionExercise({
  question,
  readOnly = false,
  initialResponse,
  onSave,
  showAnswers = false,
  enableSounds = true,
  enableHints = true,
  enableConfetti = true,
  difficulty = 'medium',
  hintText
}: DraggableCompletionExerciseProps) {
  // State for tracking answers
  const [answers, setAnswers] = useState<{ blankId: string; answer: string }[]>([]);

  // State for tracking which blanks have been filled
  const [filledBlanks, setFilledBlanks] = useState<Record<string, string>>({});

  // State for tracking available answer options
  const [availableOptions, setAvailableOptions] = useState<{ id: string; text: string }[]>([]);

  // State for tracking which option is being dragged
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // State for tracking if sounds are muted
  const [soundsMuted, setSoundsMuted] = useState<boolean>(!enableSounds);

  // State for tracking if hints are used
  const [hintsUsed, setHintsUsed] = useState<number>(0);

  // State for tracking the current hint target (which blank to highlight)
  const [hintTarget, setHintTarget] = useState<string | null>(null);

  // State for tracking if all answers are correct
  const [allCorrect, setAllCorrect] = useState<boolean>(false);

  // State for tracking if distractors are added (based on difficulty)
  const [hasDistractors, setHasDistractors] = useState<boolean>(difficulty !== 'easy');

  // State for rendering text with blanks
  const [textWithBlanks, setTextWithBlanks] = useState<React.ReactNode[]>([]);

  // Ref to track if sounds have been preloaded
  const soundsPreloaded = useRef(false);

  // Ref to track the container for keyboard focus
  const containerRef = useRef<HTMLDivElement>(null);

  // Configure sensors for keyboard and pointer events
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before activation
        delay: 150, // 150ms delay before activation to prevent interference with text inputs
        tolerance: 5, // 5px of movement allowed during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize answers and options from question data
  useEffect(() => {
    // Preload sounds if not already done
    if (!soundsPreloaded.current && enableSounds) {
      preloadSounds();
      soundsPreloaded.current = true;
    }

    // Initialize answers from initial response if available
    if (initialResponse?.answers) {
      setAnswers(initialResponse.answers);

      // Set filled blanks based on initial response
      const initialFilledBlanks: Record<string, string> = {};
      initialResponse.answers.forEach(answer => {
        if (answer.answer) {
          initialFilledBlanks[answer.blankId] = answer.answer;
        }
      });
      setFilledBlanks(initialFilledBlanks);

      // Create answer options excluding those already used
      const usedAnswers = new Set(initialResponse.answers.map(a => a.answer).filter(Boolean));
      const remainingOptions = question.questionData.blanks
        .filter(blank => !usedAnswers.has(blank.answer))
        .map(blank => ({
          id: blank.id,
          text: blank.answer
        }));

      setAvailableOptions(shuffleArray([...remainingOptions]));
    } else {
      // Initialize empty answers
      const initialAnswers = question.questionData.blanks.map(blank => ({
        blankId: blank.id,
        answer: ''
      }));
      setAnswers(initialAnswers);

      // Create answer options from the blanks
      let options = question.questionData.blanks.map(blank => ({
        id: blank.id,
        text: blank.answer
      }));

      // Add distractors based on difficulty
      if (hasDistractors) {
        const distractorCount = difficulty === 'hard' ? 3 : 1;
        const distractors = generateDistractors(options.map(o => o.text), distractorCount);

        // Add distractors with unique IDs
        distractors.forEach(distractor => {
          options.push({
            id: `distractor-${uuidv4()}`,
            text: distractor
          });
        });
      }

      // Shuffle the options for a challenge
      setAvailableOptions(shuffleArray([...options]));
    }
  }, [question, initialResponse, enableSounds]);

  // Update text with blanks when answers change
  useEffect(() => {
    // Parse the text and create elements with droppable areas for blanks
    const { text, blanks } = question.questionData;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Check if we're dealing with placeholder-style blanks or position-style blanks
    const hasPlaceholders = blanks.some(blank => {
      const placeholder = `[blank${blank.position}]`;
      return text.includes(placeholder);
    });

    if (hasPlaceholders) {
      // Handle placeholder-style blanks (e.g., [blank1], [blank2])
      let workingText = text;
      const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

      sortedBlanks.forEach((blank, index) => {
        const placeholder = `[blank${blank.position}]`;
        const textParts = workingText.split(placeholder);

        if (textParts.length > 1) {
          // Add text before the blank
          parts.push(textParts[0]);

          // Add the droppable area or filled blank
          const answer = filledBlanks[blank.id] || '';
          const isCorrect = showAnswers && answer.toLowerCase() === blank.answer.toLowerCase();
          const isIncorrect = showAnswers && answer && answer.toLowerCase() !== blank.answer.toLowerCase();

          parts.push(
            <span key={blank.id} className="inline-block mx-1">
              {readOnly || (showAnswers && answer) ? (
                <span
                  className={`px-3 py-1 border rounded-md ${
                    isCorrect ? 'bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700' :
                    isIncorrect ? 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700' :
                    'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                  }`}
                >
                  {answer || '______'}
                  {showAnswers && isIncorrect && (
                    <span className="ml-2 text-xs text-green-600">({blank.answer})</span>
                  )}
                </span>
              ) : (
                answer ? (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span
                      onClick={() => handleRemoveAnswer(blank.id)}
                      className={`inline-flex min-w-[100px] h-8 px-3 py-1 border rounded-md cursor-pointer
                        bg-primary-50 border-primary-300 hover:bg-primary-100 hover:border-primary-400
                        transition-all duration-200 items-center justify-between`}
                    >
                      <span className="text-primary-700">{answer}</span>
                      <Trash2 className="h-3 w-3 ml-2 text-primary-400 hover:text-primary-600" />
                    </span>
                  </motion.div>
                ) : (
                  <Droppable
                    id={blank.id}
                    className={`inline-flex min-w-[100px] h-8 px-3 py-1 border border-dashed rounded-md
                      transition-all duration-200
                      ${hintTarget === blank.id
                        ? 'bg-amber-50 border-amber-300 animate-pulse'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'}
                    `}
                  >
                    <span className={`${hintTarget === blank.id ? 'text-amber-600' : 'text-gray-400'}`}>
                      Drop answer here
                    </span>
                  </Droppable>
                )
              )}
            </span>
          );

          // Update working text to be the remainder
          workingText = textParts.slice(1).join(placeholder);
        }
      });

      // Add any remaining text
      if (workingText) {
        parts.push(workingText);
      }
    } else {
      // Handle position-style blanks (using numeric indices)
      // Sort blanks by position to ensure correct order
      const sortedBlanks = [...blanks].sort((a, b) => a.position - b.position);

      sortedBlanks.forEach((blank, index) => {
        // Skip blanks with invalid positions
        if (blank.position < 0 || blank.position >= text.length) {
          console.warn(`Blank at position ${blank.position} is outside the text range`);
          return;
        }

        // Add text before the blank
        if (blank.position > lastIndex) {
          parts.push(text.substring(lastIndex, blank.position));
        }

        // Add the droppable area or filled blank
        const answer = filledBlanks[blank.id] || '';
        const isCorrect = showAnswers && answer.toLowerCase() === blank.answer.toLowerCase();
        const isIncorrect = showAnswers && answer && answer.toLowerCase() !== blank.answer.toLowerCase();

        parts.push(
          <span key={blank.id} className="inline-block mx-1">
            {readOnly || (showAnswers && answer) ? (
              <span
                className={`px-3 py-1 border rounded-md ${
                  isCorrect ? 'bg-green-100 border-green-300 dark:bg-green-900/40 dark:border-green-700' :
                  isIncorrect ? 'bg-red-100 border-red-300 dark:bg-red-900/40 dark:border-red-700' :
                  'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                {answer || '______'}
                {showAnswers && isIncorrect && (
                  <span className="ml-2 text-xs text-green-600">({blank.answer})</span>
                )}
              </span>
            ) : (
              answer ? (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    onClick={() => handleRemoveAnswer(blank.id)}
                    className={`inline-flex min-w-[100px] h-8 px-3 py-1 border rounded-md cursor-pointer
                      bg-primary-50 border-primary-300 hover:bg-primary-100 hover:border-primary-400
                      transition-all duration-200 items-center justify-between`}
                  >
                    <span className="text-primary-700">{answer}</span>
                    <Trash2 className="h-3 w-3 ml-2 text-primary-400 hover:text-primary-600" />
                  </span>
                </motion.div>
              ) : (
                <Droppable
                  id={blank.id}
                  className={`inline-flex min-w-[100px] h-8 px-3 py-1 border border-dashed rounded-md
                    transition-all duration-200
                    ${hintTarget === blank.id
                      ? 'bg-amber-50 border-amber-300 animate-pulse'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'}
                  `}
                >
                  <span className={`${hintTarget === blank.id ? 'text-amber-600' : 'text-gray-400'}`}>
                    Drop answer here
                  </span>
                </Droppable>
              )
            )}
          </span>
        );

        // Update last index
        lastIndex = blank.position;
      });

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }
    }

    setTextWithBlanks(parts);
  }, [question, filledBlanks, readOnly, showAnswers]);

  // Handle drag start event
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);

    // Play sound effect
    if (!soundsMuted) {
      playSound('CLICK');
    }
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      const optionId = active.id as string;
      const blankId = over.id as string;

      // Find the option that was dragged
      const option = availableOptions.find(opt => opt.id === optionId);

      if (option) {
        // Update filled blanks
        setFilledBlanks(prev => ({
          ...prev,
          [blankId]: option.text
        }));

        // Update answers
        setAnswers(prev =>
          prev.map(answer =>
            answer.blankId === blankId ? { ...answer, answer: option.text } : answer
          )
        );

        // Remove the option from available options
        setAvailableOptions(prev => prev.filter(opt => opt.id !== optionId));

        // Play success sound
        if (!soundsMuted) {
          playSound('DROP');
        }

        // Show toast for correct answer if in show answers mode
        if (showAnswers) {
          const blank = question.questionData.blanks.find(b => b.id === blankId);
          if (blank && option.text.toLowerCase() === blank.answer.toLowerCase()) {
            toast.success('Correct answer!', { duration: 1500 });
            if (!soundsMuted) {
              playSound('SUCCESS');
            }
          }
        }
      }
    }
  };

  // Handle removing an answer from a blank
  const handleRemoveAnswer = (blankId: string) => {
    // Get the answer text
    const answerText = filledBlanks[blankId];
    if (!answerText) return;

    // Find the original blank to get its ID
    const originalBlank = question.questionData.blanks.find(b => b.id === blankId);
    if (!originalBlank) return;

    // Create a new option and add it back to available options
    const newOption = {
      id: originalBlank.id,
      text: answerText
    };

    setAvailableOptions(prev => [...prev, newOption]);

    // Remove from filled blanks
    const newFilledBlanks = { ...filledBlanks };
    delete newFilledBlanks[blankId];
    setFilledBlanks(newFilledBlanks);

    // Update answers
    setAnswers(prev =>
      prev.map(answer =>
        answer.blankId === blankId ? { ...answer, answer: '' } : answer
      )
    );

    // Play sound effect
    if (!soundsMuted) {
      playSound('POP');
    }
  };

  // Handle reset
  const handleReset = () => {
    // Reset answers
    const resetAnswers = question.questionData.blanks.map(blank => ({
      blankId: blank.id,
      answer: ''
    }));
    setAnswers(resetAnswers);

    // Clear filled blanks
    setFilledBlanks({});

    // Reset available options
    const options = question.questionData.blanks.map(blank => ({
      id: blank.id,
      text: blank.answer
    }));
    setAvailableOptions(shuffleArray([...options]));

    // Play sound effect
    if (!soundsMuted) {
      playSound('CLICK');
    }

    toast.success('Exercise reset!', { duration: 1500 });
  };

  // Toggle sound mute
  const toggleSound = () => {
    setSoundsMuted(!soundsMuted);
    if (soundsMuted) {
      // If we're unmuting, play a sound to confirm
      playSound('CLICK');
    }
  };

  // Handle using a hint
  const handleUseHint = () => {
    // Increment hint counter
    setHintsUsed(prev => prev + 1);

    // Find an empty blank to hint at
    const emptyBlanks = answers
      .filter(answer => !answer.answer.trim())
      .map(answer => answer.blankId);

    if (emptyBlanks.length > 0) {
      // Choose a random empty blank
      const randomBlankId = emptyBlanks[Math.floor(Math.random() * emptyBlanks.length)];
      setHintTarget(randomBlankId);

      // Clear the hint target after 3 seconds
      setTimeout(() => {
        setHintTarget(null);
      }, 3000);

      // Find the correct answer for this blank
      const blank = question.questionData.blanks.find(b => b.id === randomBlankId);
      if (blank) {
        // Find the option with this answer
        const option = availableOptions.find(opt =>
          opt.text.toLowerCase() === blank.answer.toLowerCase()
        );

        if (option) {
          // Highlight this option
          toast.success(`Try using "${option.text}" for one of the blanks`, {
            duration: 3000,
            icon: '💡',
          });
        }
      }
    } else {
      // All blanks are filled, suggest checking answers
      toast.success('All blanks are filled! Try submitting your answer.', {
        duration: 3000,
        icon: '✅',
      });
    }
  };

  // Check if all answers are correct
  const checkAllCorrect = () => {
    // Only check if all blanks are filled
    const emptyAnswers = answers.filter(answer => !answer.answer.trim());
    if (emptyAnswers.length > 0) return false;

    // Check each answer against the correct answer
    for (const answer of answers) {
      const blank = question.questionData.blanks.find(b => b.id === answer.blankId);
      if (!blank) continue;

      if (answer.answer.toLowerCase() !== blank.answer.toLowerCase()) {
        return false;
      }
    }

    return true;
  };

  // Handle save
  const handleSave = () => {
    // Check if all blanks have been filled
    const emptyAnswers = answers.filter(answer => !answer.answer.trim());
    if (emptyAnswers.length > 0) {
      toast.error('Please fill in all blanks before saving');
      if (!soundsMuted) {
        playSound('ERROR');
      }
      return;
    }

    // Check if all answers are correct
    const isAllCorrect = checkAllCorrect();
    setAllCorrect(isAllCorrect);

    if (onSave) {
      onSave({ answers });

      // Play success sound
      if (!soundsMuted) {
        playSound('SUCCESS');
      }

      // Show appropriate toast and confetti based on correctness
      if (isAllCorrect) {
        toast.success('Great job! All answers are correct!', {
          icon: '🎉',
          duration: 3000,
        });

        // Trigger confetti if enabled
        if (enableConfetti) {
          triggerCompletionConfetti();
        }
      } else if (showAnswers) {
        toast.success('Answer saved. Check the correct answers highlighted in green.', {
          duration: 3000,
        });
      } else {
        toast.success('Answer saved successfully!');
      }
    }
  };

  // Utility function to shuffle an array
  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Generate distractor words that are similar to the correct answers
  const generateDistractors = (correctAnswers: string[], count: number): string[] => {
    const distractors: string[] = [];

    // Simple algorithm to create distractors:
    // 1. Swap letters in the correct answers
    // 2. Add or remove a letter
    // 3. Use a synonym or related word if possible

    const commonMistakes = [
      { from: 'a', to: 'e' },
      { from: 'i', to: 'y' },
      { from: 's', to: 'z' },
      { from: 'c', to: 'k' },
      { from: 'f', to: 'ph' },
      { from: 'o', to: 'ou' },
      { from: 'er', to: 'or' },
      { from: 'ing', to: 'in' },
    ];

    // Create more distractors than needed, then we'll pick randomly
    for (const answer of correctAnswers) {
      if (answer.length < 3) continue; // Skip very short words

      // Method 1: Swap letters
      if (answer.length > 3) {
        const chars = answer.split('');
        const pos1 = Math.floor(Math.random() * (chars.length - 1));
        const pos2 = pos1 + 1;
        [chars[pos1], chars[pos2]] = [chars[pos2], chars[pos1]];
        distractors.push(chars.join(''));
      }

      // Method 2: Apply common mistakes
      for (const mistake of commonMistakes) {
        if (answer.includes(mistake.from)) {
          distractors.push(answer.replace(mistake.from, mistake.to));
          break; // Just add one mistake per word
        }
      }

      // Method 3: Add or remove a letter
      if (answer.length > 4) {
        // Remove a random letter
        const pos = Math.floor(Math.random() * answer.length);
        distractors.push(answer.slice(0, pos) + answer.slice(pos + 1));
      } else {
        // Add a random letter
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const randomLetter = letters.charAt(Math.floor(Math.random() * letters.length));
        const pos = Math.floor(Math.random() * (answer.length + 1));
        distractors.push(answer.slice(0, pos) + randomLetter + answer.slice(pos));
      }
    }

    // Ensure distractors are unique and not the same as correct answers
    const uniqueDistractors = [...new Set(distractors)]
      .filter(d => !correctAnswers.includes(d));

    // Shuffle and take the requested count
    return shuffleArray(uniqueDistractors).slice(0, count);
  };

  return (
    <div className="w-full" ref={containerRef} tabIndex={0}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{question.questionText}</h3>

        <div className="flex items-center space-x-2">
          {/* Hint button */}
          {enableHints && !readOnly && !showAnswers && (
            <HintButton
              hint={hintText || "Try dragging one of the highlighted words to fill in a blank."}
              disabled={availableOptions.length === 0}
              soundsMuted={soundsMuted}
              onUseHint={handleUseHint}
              className="mr-2"
            />
          )}

          {/* Sound toggle button */}
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="text-gray-500 hover:text-primary"
              title={soundsMuted ? "Unmute sounds" : "Mute sounds"}
            >
              <Volume2 className={`h-4 w-4 ${soundsMuted ? 'opacity-50' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      <DragDropContainer
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
        sensors={sensors}
      >
        <div className="p-4 bg-white border rounded-md mb-4 shadow-sm">
          <p className="text-lg leading-relaxed">{textWithBlanks}</p>
        </div>

        {!readOnly && !showAnswers && (
          <div className="p-4 bg-gray-50 border rounded-md shadow-sm transition-all">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <span className="mr-2">Drag answers to fill in the blanks:</span>
              {availableOptions.length === 0 && (
                <Badge variant="success" className="text-xs">All answers used!</Badge>
              )}
            </h4>

            <AnimatePresence>
              <div className="flex flex-wrap gap-2">
                {availableOptions.map(option => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Draggable
                      id={option.id}
                      className={`cursor-grab ${activeDragId === option.id ? 'z-50' : ''}`}
                    >
                      <Badge
                        variant="outline"
                        className={`px-3 py-2 bg-white hover:bg-gray-50 border shadow-sm transition-all
                          ${activeDragId === option.id ? 'ring-2 ring-primary scale-105' : ''}
                          ${hintTarget && option.text.toLowerCase() ===
                            question.questionData.blanks.find(b => b.id === hintTarget)?.answer.toLowerCase()
                            ? 'bg-amber-50 border-amber-300 animate-pulse' : 'border-gray-200 text-gray-800'}
                        `}
                      >
                        {option.text}
                        {option.id.startsWith('distractor-') && difficulty === 'hard' && (
                          <span className="sr-only">(distractor)</span>
                        )}
                      </Badge>
                    </Draggable>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {/* Instructions for removing answers */}
            {Object.keys(filledBlanks).length > 0 && (
              <p className="text-xs text-gray-500 mt-4">
                <span className="font-medium">Tip:</span> Click on a filled blank to remove the answer and return it to the options.
              </p>
            )}
          </div>
        )}

        {/* Render droppable areas with click handlers to remove answers */}
        {!readOnly && !showAnswers && (
          <div className="hidden">
            {question.questionData.blanks.map(blank => {
              const answer = filledBlanks[blank.id];
              if (!answer) return null;

              return (
                <div
                  key={`remove-${blank.id}`}
                  onClick={() => handleRemoveAnswer(blank.id)}
                  className="cursor-pointer"
                >
                  {answer}
                </div>
              );
            })}
          </div>
        )}
      </DragDropContainer>

      {!readOnly && (
        <div className="mt-6 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="transition-all hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            className="transition-all"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Answer
          </Button>
        </div>
      )}
    </div>
  );
}

export default DraggableCompletionExercise;
