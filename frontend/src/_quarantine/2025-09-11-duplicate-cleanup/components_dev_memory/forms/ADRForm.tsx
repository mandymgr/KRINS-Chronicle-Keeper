import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useToast } from "@/hooks/use-toast";
import { adrFormSchema, type ADRFormData } from "@/lib/validations";

interface ADRFormProps {
  onSuccess?: () => void;
  initialData?: Partial<ADRFormData>;
}

const ADRForm: React.FC<ADRFormProps> = ({ onSuccess, initialData }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ADRFormData>({
    resolver: zodResolver(adrFormSchema),
    defaultValues: {
      title: "",
      status: "proposed",
      context: "",
      decision: "",
      consequences: "",
      tags: "",
      ...initialData,
    },
  });

  const createADRMutation = useMutation({
    mutationFn: async (data: ADRFormData) => {
      const response = await fetch("/api/adrs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ADR: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "ADR Created Successfully",
        description: `ADR "${data.title}" has been created and assigned ID ${data.id}`,
      });
      queryClient.invalidateQueries({ queryKey: ["adrs"] });
      reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error Creating ADR",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ADRFormData) => {
    createADRMutation.mutate(data);
  };

  const watchedTags = watch("tags");
  const tagArray = watchedTags ? watchedTags.split(",").map(t => t.trim()).filter(Boolean) : [];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Architecture Decision Record</CardTitle>
        <CardDescription>
          Document an important architectural decision for your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Use PostgreSQL for primary database"
              {...register("title")}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              {...register("status")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="proposed">Proposed</option>
              <option value="accepted">Accepted</option>
              <option value="superseded">Superseded</option>
              <option value="deprecated">Deprecated</option>
            </select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          {/* Context Field */}
          <div className="space-y-2">
            <Label htmlFor="context">Context *</Label>
            <textarea
              id="context"
              rows={4}
              placeholder="Describe the issue that motivates this decision..."
              {...register("context")}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-vertical ${
                errors.context ? "border-destructive" : ""
              }`}
            />
            {errors.context && (
              <p className="text-sm text-destructive">{errors.context.message}</p>
            )}
          </div>

          {/* Decision Field */}
          <div className="space-y-2">
            <Label htmlFor="decision">Decision *</Label>
            <textarea
              id="decision"
              rows={4}
              placeholder="Describe the change that we're proposing or have agreed to implement..."
              {...register("decision")}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-vertical ${
                errors.decision ? "border-destructive" : ""
              }`}
            />
            {errors.decision && (
              <p className="text-sm text-destructive">{errors.decision.message}</p>
            )}
          </div>

          {/* Consequences Field */}
          <div className="space-y-2">
            <Label htmlFor="consequences">Consequences *</Label>
            <textarea
              id="consequences"
              rows={4}
              placeholder="Describe the resulting context, both positive and negative..."
              {...register("consequences")}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-vertical ${
                errors.consequences ? "border-destructive" : ""
              }`}
            />
            {errors.consequences && (
              <p className="text-sm text-destructive">
                {errors.consequences.message}
              </p>
            )}
          </div>

          {/* Tags Field */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              placeholder="database, architecture, performance (comma-separated)"
              {...register("tags")}
            />
            {tagArray.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tagArray.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            {errors.tags && (
              <p className="text-sm text-destructive">{errors.tags.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createADRMutation.isPending}
            >
              {isSubmitting || createADRMutation.isPending
                ? "Creating..."
                : "Create ADR"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ADRForm;