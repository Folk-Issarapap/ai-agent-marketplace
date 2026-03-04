import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from './section-header';
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@workspace/ui/components/alert';

export function CoreComponentsSection() {
  return (
    <section>
      <SectionHeader
        title="Core Components"
        description="Quick reference for the foundational UI components used across the platform"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Buttons */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Buttons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" variant="primary" className="w-full">
              Primary
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Outline
            </Button>
            <Button variant="ghost" size="sm" className="w-full">
              Ghost
            </Button>
            <Button variant="destructive" size="sm" className="w-full">
              Destructive
            </Button>
            <Button variant="secondary" size="sm" className="w-full">
              Secondary
            </Button>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="primary" size="sm">
              Primary
            </Badge>
            <Badge variant="success" size="sm">
              Success
            </Badge>
            <Badge variant="warning" size="sm">
              Warning
            </Badge>
            <Badge variant="destructive" size="sm">
              Destructive
            </Badge>
            <Badge variant="outline" size="sm">
              Outline
            </Badge>
            <Badge variant="secondary" size="sm">
              Secondary
            </Badge>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert variant="success" appearance="light" size="sm">
              <AlertIcon>
                <CheckCircle2 className="h-4 w-4" />
              </AlertIcon>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Operation completed successfully.
              </AlertDescription>
            </Alert>
            <Alert variant="warning" appearance="light" size="sm">
              <AlertIcon>
                <AlertCircle className="h-4 w-4" />
              </AlertIcon>
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Please review before proceeding.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive" appearance="light" size="sm">
              <AlertIcon>
                <AlertCircle className="h-4 w-4" />
              </AlertIcon>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
