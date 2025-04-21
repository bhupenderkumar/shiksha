import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash, Plus } from 'lucide-react';

const matchingQuestionSchema = z.object({
  type: z.literal('MATCHING'),
  points: z.number().min(1),
  content: z.object({
    instruction: z.string().min(1, 'Instruction is required'),
    leftItems: z.array(z.object({
      text: z.string().min(1, 'Item text is required'),
      id: z.string()
    })).min(2, 'At least 2 items are required'),
    rightItems: z.array(z.object({
      text: z.string().min(1, 'Item text is required'),
      id: z.string()
    })).min(2, 'At least 2 items are required')
  })
});

type MatchingQuestionFormValues = z.infer<typeof matchingQuestionSchema>;

interface MatchingQuestionFormProps {
  initialData?: MatchingQuestionFormValues;
  onSubmit: (data: MatchingQuestionFormValues) => void;
  onCancel: () => void;
}

export function MatchingQuestionForm({
  initialData,
  onSubmit,
  onCancel
}: MatchingQuestionFormProps) {
  const form = useForm<MatchingQuestionFormValues>({
    resolver: zodResolver(matchingQuestionSchema),
    defaultValues: initialData || {
      type: 'MATCHING',
      points: 1,
      content: {
        instruction: '',
        leftItems: [{ text: '', id: crypto.randomUUID() }],
        rightItems: [{ text: '', id: crypto.randomUUID() }]
      }
    }
  });

  const leftItems = useFieldArray({
    control: form.control,
    name: 'content.leftItems'
  });

  const rightItems = useFieldArray({
    control: form.control,
    name: 'content.rightItems'
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Points"
          type="number"
          {...form.register('points', { valueAsNumber: true })}
          error={form.formState.errors.points?.message}
        />
        
        <Input
          label="Instruction"
          {...form.register('content.instruction')}
          error={form.formState.errors.content?.instruction?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Left Items</h3>
              <div className="space-y-2">
                {leftItems.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input
                      {...form.register(`content.leftItems.${index}.text`)}
                      placeholder="Enter item text"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => leftItems.remove(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => leftItems.append({ text: '', id: crypto.randomUUID() })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Right Items</h3>
              <div className="space-y-2">
                {rightItems.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Input
                      {...form.register(`content.rightItems.${index}.text`)}
                      placeholder="Enter item text"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => rightItems.remove(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => rightItems.append({ text: '', id: crypto.randomUUID() })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Question
        </Button>
      </div>
    </form>
  );
}