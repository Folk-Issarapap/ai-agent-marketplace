"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller, type ControllerRenderProps, type FieldErrors } from 'react-hook-form'
import { z } from 'zod'
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Separator } from "@workspace/ui/components/separator"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@workspace/ui/components/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@workspace/ui/components/input-group'
import { Calendar as CalendarIcon, DollarSign, Upload, X } from "lucide-react"
import { Calendar } from "@workspace/ui/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"
import { useFileUpload } from '@workspace/ui/hooks/use-file-upload'
import { cn } from '@workspace/ui/lib/utils'
import { SectionHeader } from "./section-header"
import { toast } from 'sonner'

// Form validation schema
const jobFormSchema = z.object({
  goal: z.string().min(3, 'Goal must be at least 3 characters'),
  budget: z.number().min(10, 'Minimum budget is $10').max(10000, 'Maximum budget is $10,000'),
  task: z.string().min(10, 'Task description must be at least 10 characters'),
  allowedTools: z.array(z.string()).min(1, 'Select at least one tool'),
  deadline: z.string().optional(),
  attachments: z.array(z.custom<File>()).optional(),
})

type JobFormValues = z.infer<typeof jobFormSchema>

export function JobFormSection() {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    mode: 'onBlur',
    defaultValues: {
      goal: '',
      budget: undefined,
      task: '',
      allowedTools: [],
      deadline: '',
      attachments: [],
    },
  })

  // File upload hook for attachments
  const [
    { files: attachmentFiles, isDragging: isDraggingFiles, errors: fileErrors },
    {
      handleDragEnter: handleFileDragEnter,
      handleDragLeave: handleFileDragLeave,
      handleDragOver: handleFileDragOver,
      handleDrop: handleFileDrop,
      openFileDialog: openFileDialog,
      removeFile: removeAttachmentFile,
      getInputProps: getFileInputProps,
    },
  ] = useFileUpload({
    accept: '*/*',
    multiple: true,
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    onFilesChange: (files) => {
      const fileArray = files.map((f) => f.file).filter((f): f is File => f instanceof File)
      form.setValue('attachments', fileArray, { shouldValidate: true })
    },
  })

  const onSubmit = async (data: JobFormValues) => {
    try {
      // Simulate form submission
      console.log('Form data:', data)
      toast.success('Job created successfully!')
      form.reset()
    } catch (error) {
      toast.error('Failed to create job')
    }
  }

  const allowedToolsOptions = ['Web Search', 'Code Execution', 'File Access']

  return (
    <section>
      <SectionHeader
        title="Job Creation Form"
        description="Define goal, task, allowed tools, budget, deadline, and file attachments for new jobs"
        reference="PRD Section 5.2.1"
      />
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Create New Job</CardTitle>
          <CardDescription>
            Specify all required parameters to create a new AI agent job
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Goal Field */}
              <Controller
                name="goal"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }: {
                  field: ControllerRenderProps<JobFormValues, 'goal'>
                  fieldState: { invalid: boolean; error?: FieldErrors<JobFormValues>['goal'] }
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Goal <span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          id={field.name}
                          type="text"
                          placeholder="e.g., Create a blog post about AI technology"
                          disabled={form.formState.isSubmitting}
                          aria-invalid={fieldState.invalid}
                        />
                      </InputGroup>
                      {!fieldState.invalid && (
                        <FieldDescription>Define the objective</FieldDescription>
                      )}
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                  </Field>
                )}
              />

              {/* Budget Field */}
              <Controller
                name="budget"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }: {
                  field: ControllerRenderProps<JobFormValues, 'budget'>
                  fieldState: { invalid: boolean; error?: FieldErrors<JobFormValues>['budget'] }
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Budget <span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupAddon>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value
                            field.onChange(value ? Number(value) : undefined)
                          }}
                          id={field.name}
                          type="number"
                          placeholder="50"
                          disabled={form.formState.isSubmitting}
                          aria-invalid={fieldState.invalid}
                        />
                      </InputGroup>
                      {!fieldState.invalid && (
                        <FieldDescription>Min: $10 &middot; Max: $10,000</FieldDescription>
                      )}
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                  </Field>
                )}
              />
            </div>

            {/* Task Description Field */}
            <Controller
              name="task"
              control={form.control}
              render={({
                field,
                fieldState,
              }: {
                field: ControllerRenderProps<JobFormValues, 'task'>
                fieldState: { invalid: boolean; error?: FieldErrors<JobFormValues>['task'] }
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Task Description <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="Describe the task in detail..."
                      rows={4}
                      disabled={form.formState.isSubmitting}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Allowed Tools Field */}
            <Controller
              name="allowedTools"
              control={form.control}
              render={({
                field,
                fieldState,
              }: {
                field: ControllerRenderProps<JobFormValues, 'allowedTools'>
                fieldState: { invalid: boolean; error?: FieldErrors<JobFormValues>['allowedTools'] }
              }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Allowed Tools</FieldLabel>
                  <FieldContent>
                    <div className="flex flex-wrap gap-4">
                      {allowedToolsOptions.map((tool) => (
                        <div key={tool} className="flex items-center gap-2">
                          <Checkbox
                            id={`tool-${tool}`}
                            checked={field.value?.includes(tool)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, tool])
                              } else {
                                field.onChange(current.filter((t: string) => t !== tool))
                              }
                            }}
                            disabled={form.formState.isSubmitting}
                          />
                          <label
                            htmlFor={`tool-${tool}`}
                            className="font-normal cursor-pointer text-sm text-muted-foreground"
                          >
                            {tool}
                          </label>
                        </div>
                      ))}
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                </Field>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Deadline Field */}
              <Controller
                name="deadline"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }: {
                  field: ControllerRenderProps<JobFormValues, 'deadline'>
                  fieldState: { invalid: boolean; error?: FieldErrors<JobFormValues>['deadline'] }
                }) => {
                  const selectedDate = field.value ? new Date(field.value) : undefined
                  
                  return (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Deadline</FieldLabel>
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
                                field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                              }}
                              disabled={form.formState.isSubmitting}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </FieldContent>
                    </Field>
                  )
                }}
              />

              {/* Attachments Field */}
              <Controller
                name="attachments"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }: {
                  field: ControllerRenderProps<JobFormValues, 'attachments'>
                  fieldState: { invalid: boolean; error?: FieldErrors<JobFormValues>['attachments'] }
                }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Attachments</FieldLabel>
                    <FieldContent>
                      <div className="space-y-3">
                        {/* File input (hidden) */}
                        <input
                          {...getFileInputProps()}
                          className="sr-only"
                          aria-label="Upload files"
                        />

                        {/* Drop zone / Upload button */}
                        <div
                          onDragEnter={handleFileDragEnter}
                          onDragLeave={handleFileDragLeave}
                          onDragOver={handleFileDragOver}
                          onDrop={handleFileDrop}
                          data-dragging={isDraggingFiles || undefined}
                          className={cn(
                            'relative flex min-h-24 flex-col items-center justify-center rounded-md border border-dashed border-input p-4 transition-colors',
                            'has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50',
                            'data-[dragging=true]:bg-accent/50 data-[dragging=true]:border-ring',
                            isDraggingFiles && 'bg-accent/50 border-ring'
                          )}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start"
                            disabled={form.formState.isSubmitting}
                            onClick={openFileDialog}
                          >
                            <Upload className="mr-2 h-3.5 w-3.5" />
                            Choose Files
                          </Button>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Drag and drop files here, or click to select (max 10 files, 10MB each)
                          </p>
                        </div>

                        {/* Selected files list */}
                        {attachmentFiles.length > 0 && (
                          <div className="space-y-2">
                            {attachmentFiles.map((fileItem) => (
                              <div
                                key={fileItem.id}
                                className="flex items-center justify-between rounded-md border border-border bg-card p-2 text-sm"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <Upload className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  <span className="truncate text-foreground">
                                    {fileItem.file instanceof File
                                      ? fileItem.file.name
                                      : fileItem.file.name}
                                  </span>
                                  <span className="shrink-0 text-xs text-muted-foreground">
                                    {fileItem.file instanceof File
                                      ? `${(fileItem.file.size / 1024).toFixed(1)} KB`
                                      : `${(fileItem.file.size / 1024).toFixed(1)} KB`}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 shrink-0"
                                  disabled={form.formState.isSubmitting}
                                  onClick={() => removeAttachmentFile(fileItem.id)}
                                  aria-label="Remove file"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* File errors */}
                        {fileErrors.length > 0 && (
                          <div className="space-y-1">
                            {fileErrors.map((error, index) => (
                              <p key={index} className="text-xs text-destructive">
                                {error}
                              </p>
                            ))}
                          </div>
                        )}

                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </div>
                    </FieldContent>
                  </Field>
                )}
              />
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  toast.info('Form reset')
                }}
                disabled={form.formState.isSubmitting}
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Publishing...' : 'Publish Job'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
