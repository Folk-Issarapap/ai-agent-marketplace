import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@workspace/ui/components/card';

interface RawDataViewerProps {
  /**
   * The data object to display in JSON format
   */
  data: unknown;
  /**
   * Title of the raw data section
   * @default "Database Record"
   */
  title?: string;
  /**
   * Description explaining what the raw data represents
   */
  description?: string;
  /**
   * Name of the database table (e.g., "accounts", "businesses")
   */
  tableName?: string;
  /**
   * ID of the specific record being displayed
   */
  recordId?: string;
  /**
   * List of common use cases for viewing this raw data
   */
  useCases?: string[];
  /**
   * Optional title shown above the use cases list
   * @default "Common Use Cases:"
   */
  useCasesTitle?: string;
  /**
   * Additional note or warning to display
   */
  note?: string;
  /**
   * Optional label shown before the note text
   * @default "Note:"
   */
  noteLabel?: string;
}

/**
 * RawDataViewer - A reusable component for displaying raw database records
 *
 * @example
 * ```tsx
 * <RawDataViewer
 *   data={account.data}
 *   title="Account Database Record"
 *   tableName="accounts"
 *   recordId={account.data.id}
 *   useCases={[
 *     'Debugging account issues',
 *     'Verifying timestamps',
 *   ]}
 * />
 * ```
 */
export function RawDataViewer({
  data,
  title = 'Database Record',
  description = 'This is the complete raw database record in JSON format. This view is useful for debugging, technical support, and verifying exact field values stored in the database.',
  tableName,
  recordId,
  useCases = [
    'Debugging related issues',
    'Verifying exact timestamps and metadata',
    'Checking audit trail fields (created_by, updated_by, etc.)',
    'Inspecting null vs empty values',
    'Technical support and troubleshooting',
  ],
  useCasesTitle = 'Common Use Cases:',
  note = 'All database fields use snake_case naming convention. Sensitive data like passwords are never stored or displayed here.',
  noteLabel = 'Note:',
}: RawDataViewerProps) {
  return (
    <Card className="w-full overflow-visible">
      <CardHeader className="py-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 w-full min-w-0 overflow-visible">
        {useCases.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{useCasesTitle}</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {useCases.map((useCase, index) => (
                <li key={index}>{useCase}</li>
              ))}
            </ul>
          </div>
        )}

        {note && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              <strong>{noteLabel}</strong> {note}
            </p>
          </div>
        )}

        <div className="rounded-lg border bg-muted/50 w-full max-w-full">
          {(tableName || recordId) && (
            <div className="border-b bg-muted px-4 py-2 shrink-0">
              <p className="text-xs font-mono text-muted-foreground wrap-break-word whitespace-normal">
                {tableName && `${tableName} table`}
                {tableName && recordId && ' - '}
                {recordId && `Record ID: ${recordId}`}
              </p>
            </div>
          )}
          <div
            className="overflow-x-scroll overflow-y-hidden w-full"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <pre className="whitespace-pre p-4 text-xs font-mono block wrap-break-word">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RawDataViewerSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="h-16 w-full animate-pulse rounded-md bg-muted" />

        <div className="h-96 w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
