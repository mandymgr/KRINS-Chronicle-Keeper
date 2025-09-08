import React from "react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Badge } from "../ui/Badge";
import { useToast } from "@/hooks/use-toast";

const UIShowcase: React.FC = () => {
  const { toast } = useToast();

  const showToast = () => {
    toast({
      title: "UI Component Test",
      description: "All KRINS UI components are working perfectly!",
    });
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          KRINS UI Component Library
        </h1>
        <p className="text-muted-foreground text-lg">
          Modern, accessible components for organizational intelligence
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Button Components</CardTitle>
          <CardDescription>Various button styles and states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input fields and labels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="example-input">Example Input</Label>
              <Input
                id="example-input"
                placeholder="Type something..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="example-input-2">Another Input</Label>
              <Input
                id="example-input-2"
                type="email"
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Components</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Test */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Test</CardTitle>
          <CardDescription>Test toast notifications and interactivity</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={showToast} className="w-full md:w-auto">
            Show Toast Notification
          </Button>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="bg-success-50 border-success-200">
        <CardHeader>
          <CardTitle className="text-success-800">
            ✅ KRINS UI Modernization Complete
          </CardTitle>
          <CardDescription className="text-success-700">
            Enterprise-grade organizational intelligence with modern UI/UX
          </CardDescription>
        </CardHeader>
        <CardContent className="text-success-800">
          <ul className="space-y-1 text-sm">
            <li>✅ shadcn/ui component library integrated</li>
            <li>✅ Type-safe forms with Zod validation</li>
            <li>✅ TanStack Query for API state management</li>
            <li>✅ Toast notifications system</li>
            <li>✅ Design system with CSS variables</li>
            <li>✅ Maintained enterprise PostgreSQL + pgvector core</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default UIShowcase;