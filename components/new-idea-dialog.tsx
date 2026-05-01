"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Lightbulb, Users, Send, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  status: string;
}

interface NewIdeaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onIdeaCreated?: () => void;
}

export function NewIdeaDialog({ isOpen, onClose, onIdeaCreated }: NewIdeaDialogProps) {
  const { profile } = useAuth();
  
  const [ideaData, setIdeaData] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    shareWithStaff: false,
    selectedStaff: [] as string[]
  });
  
  const [staff, setStaff] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  // Fetch staff when dialog opens
  useEffect(() => {
    if (isOpen && ideaData.shareWithStaff) {
      fetchStaff();
    }
  }, [isOpen, ideaData.shareWithStaff]);

  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, status")
        .eq("role", "staff")
        .order("full_name");

      if (error) throw error;
      setStaff(data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to load staff list");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleStaffToggle = (staffId: string, checked: boolean) => {
    if (checked) {
      setIdeaData(prev => ({
        ...prev,
        selectedStaff: [...prev.selectedStaff, staffId]
      }));
    } else {
      setIdeaData(prev => ({
        ...prev,
        selectedStaff: prev.selectedStaff.filter(id => id !== staffId)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) {
      toast.error("You must be logged in to create an idea");
      return;
    }

    if (!ideaData.content.trim()) {
      toast.error("Please enter your idea content");
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("ideas")
        .insert({
          title: ideaData.title.trim() || null,
          content: ideaData.content.trim(),
          priority: ideaData.priority,
          created_by: profile.id,
          shared_with: ideaData.shareWithStaff ? ideaData.selectedStaff : [],
          archived: false,
          signal_cleared: false
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Idea created successfully!");
      
      // Reset form
      setIdeaData({
        title: "",
        content: "",
        priority: "medium",
        shareWithStaff: false,
        selectedStaff: []
      });
      
      onClose();
      onIdeaCreated?.();
      
    } catch (error) {
      console.error("Error creating idea:", error);
      toast.error("Failed to create idea");
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20", 
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    urgent: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-theme-card border-theme-border-10 text-theme-text max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            New Strategic Idea
          </DialogTitle>
          <DialogDescription>
            Create a new strategic idea or directive to share with your team. Add details, set priority, and choose who to share it with.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-theme-text-80">
              Title (Optional)
            </Label>
            <Input
              id="title"
              value={ideaData.title}
              onChange={(e) => setIdeaData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief title for your idea..."
              className="bg-theme-bg border-theme-border-20 text-theme-text placeholder:text-theme-text-40"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-theme-text-80">
              Idea Content *
            </Label>
            <Textarea
              id="content"
              value={ideaData.content}
              onChange={(e) => setIdeaData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Describe your strategic idea, directive, or innovation..."
              className="bg-theme-bg border-theme-border-20 text-theme-text placeholder:text-theme-text-40 min-h-[120px] resize-none"
              required
            />
          </div>

          {/* Priority */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-theme-text-80">Priority Level</Label>
            <RadioGroup
              value={ideaData.priority}
              onValueChange={(value) => setIdeaData(prev => ({ ...prev, priority: value as any }))}
              className="flex flex-wrap gap-3"
            >
              {(["low", "medium", "high", "urgent"] as const).map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <RadioGroupItem value={priority} id={priority} className="sr-only" />
                  <Label
                    htmlFor={priority}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                      priorityColors[priority]
                    } ${
                      ideaData.priority === priority
                        ? "ring-2 ring-offset-2 ring-offset-theme-card"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {priority}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Share with Staff */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="shareWithStaff"
                checked={ideaData.shareWithStaff}
                onCheckedChange={(checked) => 
                  setIdeaData(prev => ({ ...prev, shareWithStaff: !!checked, selectedStaff: [] }))
                }
              />
              <Label htmlFor="shareWithStaff" className="text-sm font-medium text-theme-text-80 cursor-pointer">
                Share with Staff Members
              </Label>
              <Users className="w-4 h-4 text-theme-text-40" />
            </div>

            {ideaData.shareWithStaff && (
              <div className="space-y-3 pl-7">
                {staffLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin h-5 w-5 border-2 border-theme-border-20 border-t-theme-accent rounded-full mx-auto" />
                    <p className="text-xs text-theme-text-40 mt-2">Loading staff...</p>
                  </div>
                ) : staff.length === 0 ? (
                  <p className="text-xs text-theme-text-40">No staff members available</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {staff.map((staffMember) => (
                      <div key={staffMember.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`staff-${staffMember.id}`}
                          checked={ideaData.selectedStaff.includes(staffMember.id)}
                          onCheckedChange={(checked) => 
                            handleStaffToggle(staffMember.id, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`staff-${staffMember.id}`}
                          className="text-xs text-theme-text-80 cursor-pointer flex items-center gap-2"
                        >
                          <span>{staffMember.full_name}</span>
                          <Badge variant="outline" className="text-[8px] px-1 py-0 border-theme-border-20">
                            {staffMember.status}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>


          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-theme-border-10">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-theme-text-60 hover:text-theme-text hover:bg-theme-hover"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="text-xs text-theme-text-40">
                {ideaData.shareWithStaff && ideaData.selectedStaff.length > 0 && 
                  `Will share with ${ideaData.selectedStaff.length} staff member(s)`
                }
              </div>
              <Button
                type="submit"
                disabled={loading || !ideaData.content.trim()}
                className="bg-theme-accent text-theme-accent-foreground hover:bg-theme-accent/90 font-bold"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Idea
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
