'use client';

import { useId, useMemo, useState, useCallback } from 'react';
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from 'lucide-react';

import { cn } from '@workspace/ui/lib/utils';
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
} from '@workspace/ui/components/input-group';
import { Label } from '@workspace/ui/components/label';

interface PasswordInputMessages {
  label?: string;
  placeholder?: string;
  showPassword?: string;
  hidePassword?: string;
  enterPassword?: string;
  weakPassword?: string;
  mediumPassword?: string;
  strongPassword?: string;
  mustContain?: string;
  requirementMet?: string;
  requirementNotMet?: string;
  requirements?: {
    minLength?: string;
    hasNumber?: string;
    hasLowercase?: string;
    hasUppercase?: string;
  };
}

const defaultMessages: Required<PasswordInputMessages> = {
  label: 'Password',
  placeholder: 'Enter password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  enterPassword: 'Enter a password',
  weakPassword: 'Weak password',
  mediumPassword: 'Medium password',
  strongPassword: 'Strong password',
  mustContain: 'Must contain:',
  requirementMet: ' - Requirement met',
  requirementNotMet: ' - Requirement not met',
  requirements: {
    minLength: 'At least 8 characters',
    hasNumber: 'At least 1 number',
    hasLowercase: 'At least 1 lowercase letter',
    hasUppercase: 'At least 1 uppercase letter',
  },
};

interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  label?: string;
  messages?: Partial<PasswordInputMessages>;
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function PasswordInput({
  className,
  label,
  messages,
  showStrengthIndicator = true,
  showRequirements = true,
  value,
  onChange,
  id,
  placeholder,
  ...props
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;

  const [password, setPassword] = useState(value ?? '');
  const [isVisible, setIsVisible] = useState(false);

  const mergedMessages = useMemo(() => {
    const merged: Required<PasswordInputMessages> = {
      ...defaultMessages,
      ...messages,
      requirements: {
        ...defaultMessages.requirements,
        ...messages?.requirements,
      },
    };
    return merged;
  }, [messages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPassword(newValue);
    onChange?.(e);
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const checkStrength = useCallback(
    (pass: string) => {
      const requirements = [
        { regex: /.{8,}/, text: mergedMessages.requirements.minLength },
        { regex: /[0-9]/, text: mergedMessages.requirements.hasNumber },
        { regex: /[a-z]/, text: mergedMessages.requirements.hasLowercase },
        { regex: /[A-Z]/, text: mergedMessages.requirements.hasUppercase },
      ];

      return requirements.map((req) => ({
        met: req.regex.test(pass),
        text: req.text,
      }));
    },
    [mergedMessages.requirements]
  );

  const strength = useMemo(() => checkStrength(password), [password, checkStrength]);

  const strengthScore = useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-border';
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score === 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return mergedMessages.enterPassword;
    if (score <= 2) return mergedMessages.weakPassword;
    if (score === 3) return mergedMessages.mediumPassword;
    return mergedMessages.strongPassword;
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Password input field with toggle visibility button */}
      <div className="space-y-2">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <InputGroup>
          <InputGroupInput
            id={inputId}
            className="pe-9"
            placeholder={placeholder ?? mergedMessages.placeholder}
            type={isVisible ? 'text' : 'password'}
            value={password}
            onChange={handleChange}
            aria-describedby={showStrengthIndicator || showRequirements ? descriptionId : undefined}
            {...props}
          />
          <InputGroupButton
            type="button"
            onClick={toggleVisibility}
            aria-label={isVisible ? mergedMessages.hidePassword : mergedMessages.showPassword}
            aria-pressed={isVisible}
            aria-controls={inputId}
          >
            {isVisible ? (
              <EyeOffIcon size={16} aria-hidden="true" />
            ) : (
              <EyeIcon size={16} aria-hidden="true" />
            )}
          </InputGroupButton>
        </InputGroup>
      </div>

      {/* Password strength indicator */}
      {showStrengthIndicator && (
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-border"
          role="progressbar"
          aria-valuenow={strengthScore}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label="Password strength"
        >
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out',
              getStrengthColor(strengthScore)
            )}
            style={{ width: `${(strengthScore / 4) * 100}%` }}
          />
        </div>
      )}

      {/* Password strength description and requirements */}
      {(showStrengthIndicator || showRequirements) && (
        <div id={descriptionId}>
          {/* Password strength description */}
          {showStrengthIndicator && (
            <p className="mb-2 text-sm font-medium text-foreground">
              {getStrengthText(strengthScore)}
            </p>
          )}

          {/* Password requirements list */}
          {showRequirements && (
            <>
              <p className="mb-2 text-sm font-medium text-foreground">
                {mergedMessages.mustContain}
              </p>
              <ul className="space-y-1.5" aria-label="Password requirements">
                {strength.map((req, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {req.met ? (
                      <CheckIcon size={16} className="text-emerald-500" aria-hidden="true" />
                    ) : (
                      <XIcon size={16} className="text-muted-foreground/80" aria-hidden="true" />
                    )}
                    <span
                      className={cn(
                        'text-xs',
                        req.met ? 'text-emerald-600' : 'text-muted-foreground'
                      )}
                    >
                      {req.text}
                      <span className="sr-only">
                        {req.met ? mergedMessages.requirementMet : mergedMessages.requirementNotMet}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export { PasswordInput, type PasswordInputProps, type PasswordInputMessages };
