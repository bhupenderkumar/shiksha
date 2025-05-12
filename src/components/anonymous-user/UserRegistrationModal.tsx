import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { useAnonymousUser } from '@/contexts/AnonymousUserContext';
import SimpleMathExercise from './SimpleMathExercise';

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  includeMathExercise?: boolean;
}

export function UserRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  includeMathExercise = false
}: UserRegistrationModalProps) {
  const { registerUser, anonymousUser, updateUser } = useAnonymousUser();
  const [name, setName] = useState(anonymousUser?.name || '');
  const [mobileNumber, setMobileNumber] = useState(anonymousUser?.mobile_number || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (anonymousUser) {
        // Update existing user
        result = await updateUser(name, mobileNumber);
      } else {
        // Register new user
        result = await registerUser(name, mobileNumber);
      }

      if (result) {
        toast.success(`Welcome, ${name}!`);
        onSuccess?.();
        onClose();
      } else {
        toast.error('Failed to register. Please try again.');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Interactive Exercises!</DialogTitle>
          <DialogDescription>
            Please enter your name to continue. Your mobile number is optional but helps us save your progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="col-span-3"
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mobile" className="text-right">
                Mobile
              </Label>
              <Input
                id="mobile"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter your mobile number (optional)"
                className="col-span-3"
                type="tel"
              />
            </div>

            {includeMathExercise && (
              <div className="mt-4">
                <SimpleMathExercise />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserRegistrationModal;
