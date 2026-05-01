"use client";

import React, { useState } from "react";
import { ClipboardList, Loader2, Plus, X, Calendar, User, Flag, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { playHoverSound, playClickSound } from "@/lib/audio-feedback";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssignTaskProps {
    staffList?: any[];
    currentUserId?: string;
    variant?: string;
}

export default function AssignTask({ staffList, currentUserId, variant }: AssignTaskProps = {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [taskTitle, setTaskTitle] = useState("");
    const [objective, setObjective] = useState("");
    const [deadline, setDeadline] = useState("");
    const [priority, setPriority] = useState("medium");
    const [taskAssignee, setTaskAssignee] = useState("");
    const [subtasks, setSubtasks] = useState<{ id: string; text: string }[]>([]);
    const [newSubtask, setNewSubtask] = useState("");
    const [repeatDaily, setRepeatDaily] = useState(false);

    const handleCreateTask = async () => {
        if (!taskTitle || !taskAssignee) return;
        
        setLoading(true);
        try {
            const taskData = {
                title: taskTitle,
                description: objective,
                due_date: deadline,
                priority: priority,
                assigned_to: taskAssignee,
                status: "pending",
                subtasks: JSON.stringify(subtasks),
                created_at: new Date().toISOString(),
            };

            const { error } = await supabase.from("tasks").insert(taskData);
            
            if (error) {
                console.error("Error creating task:", error);
            } else {
                // Reset form
                setTaskTitle("");
                setObjective("");
                setDeadline("");
                setPriority("medium");
                setTaskAssignee("");
                setSubtasks([]);
                setNewSubtask("");
                setRepeatDaily(false);
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const addSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks([...subtasks, { id: Date.now().toString(), text: newSubtask.trim() }]);
            setNewSubtask("");
        }
    };

    const removeSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                    onMouseEnter={playHoverSound}
                    onClick={playClickSound}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Task
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800">Assign New Task</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                        <Input
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="Enter task title..."
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
                        <Textarea
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            placeholder="Describe the task objective..."
                            rows={3}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                        <Input
                            value={taskAssignee}
                            onChange={(e) => setTaskAssignee(e.target.value)}
                            placeholder="Staff member ID or email..."
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                        <Input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <div className="flex gap-2">
                            {["low", "medium", "high", "urgent"].map((p) => (
                                <Button
                                    key={p}
                                    variant={priority === p ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPriority(p)}
                                    className={`capitalize ${
                                        priority === p
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {p}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtasks</label>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    placeholder="Add subtask..."
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            addSubtask();
                                        }
                                    }}
                                    className="flex-1"
                                />
                                <Button onClick={addSubtask} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {subtasks.map((subtask, index) => (
                                <div key={subtask.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <span className="text-sm">{subtask.text}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSubtask(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="repeat"
                            checked={repeatDaily}
                            onChange={(e) => setRepeatDaily(e.target.checked)}
                            className="rounded"
                        />
                        <label htmlFor="repeat" className="text-sm text-gray-700">
                            Repeat daily
                        </label>
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        onClick={handleCreateTask}
                        disabled={loading || !taskTitle || !taskAssignee}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Assign Task
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
