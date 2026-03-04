'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Briefcase, DollarSign, Calendar as CalendarIcon, AlertCircle, Save, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@workspace/ui/components/button';
import { Alert, AlertDescription, AlertIcon } from '@workspace/ui/components/alert';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@workspace/ui/components/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group';
import { Textarea } from '@workspace/ui/components/textarea';
import { Spinner } from '@workspace/ui/components/spinner';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { Calendar } from '@workspace/ui/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { format } from 'date-fns';

import { createJob } from '@/actions/jobs';
import { createJobSchema, type CreateJobFormValues } from '@/schemas/job.schema';
import { getRandomSampleJob } from '@/lib/sample-job-data';

interface JobCreateFormProps {
  lang: string;
  onSuccess?: (jobId: string) => void;
}

/**
 * Job Creation Form
 * Creates a new job in draft status
 */
export function JobCreateForm({ lang, onSuccess }: JobCreateFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [allowedTools, setAllowedTools] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState('');

  const form = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      goal: '',
      task: '',
      allowedTools: [],
      budget: '',
      deadline: '',
      maxRevisions: 2,
    },
  });

  // Reset form when component unmounts or on success
  useEffect(() => {
    return () => {
      setServerError(null);
      setAllowedTools([]);
      setToolInput('');
    };
  }, []);

  // Get first client-side validation error
  const getFirstFormError = (): string | null => {
    const errors = form.formState.errors;
    const errorKeys = Object.keys(errors) as Array<keyof typeof errors>;
    const firstErrorKey = errorKeys[0];
    if (firstErrorKey && errors[firstErrorKey]) {
      const error = errors[firstErrorKey];
      return error?.message || 'Please fix the form errors';
    }
    return null;
  };

  const clientError = getFirstFormError();

  const handleAddTool = () => {
    if (toolInput.trim() && !allowedTools.includes(toolInput.trim())) {
      const newTools = [...allowedTools, toolInput.trim()];
      setAllowedTools(newTools);
      form.setValue('allowedTools', newTools);
      setToolInput('');
    }
  };

  const handleRemoveTool = (tool: string) => {
    const newTools = allowedTools.filter((t) => t !== tool);
    setAllowedTools(newTools);
    form.setValue('allowedTools', newTools);
  };

  const handleFillSample = () => {
    const sample = getRandomSampleJob();
    form.reset(sample);
    setAllowedTools(sample.allowedTools || []);
    setToolInput('');
    setServerError(null);
    toast.success('Sample data filled. Edit as needed and submit.');
  };

  const onSubmit = async (data: CreateJobFormValues) => {
    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('goal', data.goal);
      formData.append('task', data.task);
      formData.append('budget', data.budget);
      if (data.deadline) {
        formData.append('deadline', data.deadline);
      }
      formData.append('maxRevisions', data.maxRevisions?.toString() || '2');
      if (data.allowedTools && data.allowedTools.length > 0) {
        formData.append('allowedTools', JSON.stringify(data.allowedTools));
      }

      // Call server action
      const result = await createJob(lang, formData);

      if (!result.success) {
        const errorMessage = result.message || 'Failed to create job';
        setServerError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      // Clear server error on success
      setServerError(null);
      toast.success(result.message || 'Job created successfully');
      
      // Reset form
      form.reset();
      setAllowedTools([]);
      setToolInput('');

      // Call onSuccess callback or navigate
      if (onSuccess && result.data?.jobId) {
        onSuccess(result.data.jobId);
      } else if (result.data?.jobId) {
        router.push(`/${lang}/jobs/${result.data.jobId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create job';
      setServerError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <form
      id="job-create-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <FieldGroup>
        {/* Basic Information Section */}
        <FieldSet>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Basic Information</FieldLabel>
            <FieldDescription>Provide a clear title and description for your job</FieldDescription>
          </div>
          <FieldGroup>
            {/* Title Field */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Job Title <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="text"
                        placeholder="e.g., Create a blog post about AI"
                        disabled={form.formState.isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Goal Field */}
            <Controller
              name="goal"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Goal <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldDescription>
                    What do you want to achieve with this job?
                  </FieldDescription>
                  <FieldContent>
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="Describe the overall goal or objective..."
                      disabled={form.formState.isSubmitting}
                      aria-invalid={fieldState.invalid}
                      rows={4}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Task Field */}
            <Controller
              name="task"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Task <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldDescription>
                    Provide detailed instructions for the AI agent
                  </FieldDescription>
                  <FieldContent>
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="Describe the specific tasks to be completed..."
                      disabled={form.formState.isSubmitting}
                      aria-invalid={fieldState.invalid}
                      rows={6}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        {/* Configuration Section */}
        <FieldSet>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Configuration</FieldLabel>
            <FieldDescription>Set budget, deadline, and other options</FieldDescription>
          </div>
          <FieldGroup>
            {/* Budget Field */}
            <Controller
              name="budget"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Budget (USD) <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldDescription>
                    Maximum amount you're willing to pay for this job
                  </FieldDescription>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupAddon>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="text"
                        placeholder="100.00"
                        disabled={form.formState.isSubmitting}
                        aria-invalid={fieldState.invalid}
                      />
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Deadline Field */}
            <Controller
              name="deadline"
              control={form.control}
              render={({ field, fieldState }) => {
                const selectedDate = field.value ? new Date(field.value) : undefined;
                
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Deadline (Optional)</FieldLabel>
                    <FieldDescription>
                      When should this job be completed?
                    </FieldDescription>
                    <FieldContent>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            mode="input"
                            className="w-full justify-start text-left font-normal"
                            disabled={form.formState.isSubmitting}
                            aria-invalid={fieldState.invalid}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? (
                              format(selectedDate, 'PPP')
                            ) : (
                              <span className="text-muted-foreground">Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                            }}
                            disabled={form.formState.isSubmitting}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                  </Field>
                );
              }}
            />

            {/* Max Revisions Field */}
            <Controller
              name="maxRevisions"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Max Revisions</FieldLabel>
                  <FieldDescription>
                    Maximum number of revision requests (0-5)
                  </FieldDescription>
                  <FieldContent>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      min={0}
                      max={5}
                      disabled={form.formState.isSubmitting}
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        {/* Allowed Tools Section */}
        <FieldSet>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Allowed Tools (Optional)</FieldLabel>
            <FieldDescription>
              Specify which tools the AI agent is allowed to use
            </FieldDescription>
          </div>
          <FieldGroup>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTool();
                    }
                  }}
                  placeholder="Enter tool name (e.g., web_search, code_executor)"
                  disabled={form.formState.isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTool}
                  disabled={form.formState.isSubmitting || !toolInput.trim()}
                >
                  Add
                </Button>
              </div>
              {allowedTools.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allowedTools.map((tool) => (
                    <Badge key={tool} variant="secondary" className="gap-2">
                      {tool}
                      <button
                        type="button"
                        onClick={() => handleRemoveTool(tool)}
                        className="ml-1 hover:text-destructive"
                        disabled={form.formState.isSubmitting}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      {/* Error Alerts */}
      {(clientError || serverError) && (
        <Alert variant="destructive">
          <AlertIcon>
            <AlertCircle className="h-4 w-4" />
          </AlertIcon>
          <AlertDescription>
            {serverError ? (
              <div className="space-y-1">
                <div className="font-medium">Server Error</div>
                <div>{serverError}</div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-medium">Validation Error</div>
                <div>{clientError}</div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFillSample}
          disabled={form.formState.isSubmitting}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Fill with Sample
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="job-create-form"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Job (Draft)
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
