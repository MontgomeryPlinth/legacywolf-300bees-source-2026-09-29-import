import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { incidentSearchSchema, type IncidentSearchFormData } from "../../../lib/validations";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Search, X, SlidersHorizontal, Calendar } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useApp } from "../../contexts/AppContext";

interface IncidentSearchFormProps {
  onSearch: (filters: IncidentSearchFormData) => void;
  onReset?: () => void;
}

export function IncidentSearchForm({ onSearch, onReset }: IncidentSearchFormProps) {
  const { responders } = useApp();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncidentSearchFormData>({
    resolver: zodResolver(incidentSearchSchema),
    defaultValues: {
      query: "",
      status: "all",
      priority: "all",
      responderId: "",
      sortBy: "triggeredAt",
      sortOrder: "desc",
    },
  });

  const onSubmit = (data: IncidentSearchFormData) => {
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
          <Label htmlFor="query" className="sr-only">Search incidents</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="query"
              placeholder="Search by incident ID, user name, or address..."
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

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          className="h-9 px-3 rounded-full border border-border bg-background text-sm"
          {...register("status")}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="triggered">Triggered</option>
          <option value="dispatched">Dispatched</option>
          <option value="en-route">En Route</option>
          <option value="on-scene">On Scene</option>
          <option value="resolved">Resolved</option>
          <option value="false-alarm">False Alarm</option>
        </select>

        <select
          className="h-9 px-3 rounded-full border border-border bg-background text-sm"
          {...register("priority")}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
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
            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                From Date
              </Label>
              <Input
                id="dateFrom"
                type="date"
                className="rounded-lg"
                {...register("dateFrom", {
                  setValueAs: (v) => v ? new Date(v) : undefined
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                To Date
              </Label>
              <Input
                id="dateTo"
                type="date"
                className="rounded-lg"
                {...register("dateTo", {
                  setValueAs: (v) => v ? new Date(v) : undefined
                })}
              />
            </div>

            {/* Responder Filter */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="responderId">Responder</Label>
              <select
                id="responderId"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                {...register("responderId")}
              >
                <option value="">All Responders</option>
                {responders.map((responder) => (
                  <option key={responder.id} value={responder.id}>
                    {responder.name} ({responder.totalIncidents} incidents)
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <select
                id="sortBy"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                {...register("sortBy")}
              >
                <option value="triggeredAt">Time Triggered</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="userName">User Name</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <select
                id="sortOrder"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background"
                {...register("sortOrder")}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </form>
  );
}
