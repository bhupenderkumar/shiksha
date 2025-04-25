import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface QuestionTypeFormProps {
  type: string;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function QuestionTypeForm({ type, initialData, onSubmit, onCancel }: QuestionTypeFormProps) {
  const getSchemaForType = (type: string) => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return z.object({
          question: z.string().min(1),
          options: z.array(z.string()).min(2),
          correctAnswer: z.number()
        });
      case "MATCHING":
        return z.object({
          question: z.string().min(1),
          pairs: z.array(z.object({
            left: z.string(),
            right: z.string()
          })).min(2)
        });
      // Add other question type schemas
      default:
        return z.object({
          question: z.string().min(1)
        });
    }
  };

  const form = useForm({
    resolver: zodResolver(getSchemaForType(type)),
    defaultValues: initialData
  });

  const renderFormFields = () => {
    switch (type) {
      case "MULTIPLE_CHOICE":
        return (
          <div className="space-y-4">
            <Input {...form.register("question")} placeholder="Question" />
            {form.watch("options")?.map((_, index) => (
              <Input
                key={index}
                {...form.register(`options.${index}`)}
                placeholder={`Option ${index + 1}`}
              />
            ))}
            <Select
              {...form.register("correctAnswer")}
              options={form.watch("options")?.map((opt: string, i: number) => ({
                value: i,
                label: opt
              }))}
            />
          </div>
        );
      // Add other question type forms
      default:
        return <Input {...form.register("question")} placeholder="Question" />;
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        {renderFormFields()}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Save Question</Button>
        </div>
      </CardContent>
    </Card>
  );
}