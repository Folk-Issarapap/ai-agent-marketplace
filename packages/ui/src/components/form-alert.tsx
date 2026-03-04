import { Alert, AlertDescription, AlertIcon } from '@workspace/ui/components/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

interface FormAlertProps {
  message?: string;
  variant?: 'success' | 'error';
  className?: string;
}

/**
 * FormAlert - Reusable alert component for form success/error messages
 *
 * @example
 * // Success message
 * <FormAlert message="Profile updated successfully!" variant="success" />
 *
 * @example
 * // Error message
 * <FormAlert message="Failed to update profile" variant="error" />
 *
 * @example
 * // Conditional rendering
 * {state.message && (
 *   <FormAlert
 *     message={state.message}
 *     variant={state.success ? "success" : "error"}
 *   />
 * )}
 */
export function FormAlert({ message, variant = 'error', className }: FormAlertProps) {
  if (!message) return null;

  const isSuccess = variant === 'success';

  return (
    <Alert
      variant={isSuccess ? 'success' : 'destructive'}
      className={cn(isSuccess && 'border-green-200 bg-green-50 text-green-800', className)}
    >
      {isSuccess ? (
        <AlertIcon>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </AlertIcon>
      ) : (
        <AlertIcon>
          <AlertCircle className="h-4 w-4" />
        </AlertIcon>
      )}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
