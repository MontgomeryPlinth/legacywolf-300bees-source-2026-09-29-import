import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSearchSchema, type UserSearchFormData } from "../../../lib/validations";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface UserSearchFormProps {
  onSearch: (filters: UserSearchFormData) => void;
  onReset?: () => void;
}

export function UserSearchForm({ onSearch, onReset }: UserSearchFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserSearchFormData>({
    resolver: zodResolver(userSearchSchema),
    defaultValues: {
      query: "",
      planTier: "all",
      status: "all",
      sortBy: "name",
      sortOrder: "asc",
    },
  });

  const onSubmit = (data: UserSearchFormData) => {
    onSearch(data);
  };

  const handleReset = () => {
    reset();
    onReset?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Quick Search */}
      <div className="flex gap-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="query" className="sr-only">Search users</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="query"
              placeholder="Search by name, email, or ID..."
              className="rounded-full pl-10"
              {...register("query")}
            />
          </div>
        </div>
        <Button type="submit" className="rounded-full px-6">
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full px-4"
          onClick={handleReset}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Advanced Filters */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showAdvanced ? "Hide" : "Show"} Advanced Filters
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan Tier */}
            <div className="space-y-2">
              <Label htmlFor="planTier">Plan Tier</Label>
              <select
                id="planTier"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                {...register("planTier")}
              >
                <option value="all">All Plans</option>
                <option value="friend-alert">Friend Alert</option>
                <option value="attend-check">Attend & Check</option>
                <option value="pet-guardian">Pet Guardian</option>
                <option value="full">Full Protection</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                {...register("status")}
              >
                <option value="all">All Statuses</option>
                <option value="protected">Protected</option>
                <option value="paused">Paused</option>
                <option value="trip-mode">Trip Mode</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <select
                id="sortBy"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                {...register("sortBy")}
              >
                <option value="name">Name</option>
                <option value="joinedDate">Join Date</option>
                <option value="planTier">Plan Tier</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <select
                id="sortOrder"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                {...register("sortOrder")}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </form>
  );
}
