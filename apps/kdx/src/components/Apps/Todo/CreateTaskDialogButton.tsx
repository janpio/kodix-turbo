import { useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import type { Status } from "@prisma/client";
import { format } from "date-fns";
import { Plus, X } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  PopoverTrigger,
  Textarea,
} from "@kdx/ui";

import { api } from "~/utils/api";
import { AssigneePopover } from "~/components/Apps/Todo/AssigneePopover";
import {
  PriorityIcon,
  PriorityPopover,
  PriorityToTxt,
} from "~/components/Apps/Todo/PriorityPopover";
import type { Priority } from "~/components/Apps/Todo/PriorityPopover";
import { StatusPopover } from "~/components/Apps/Todo/StatusPopover";
import {
  DatePickerIcon,
  DatePickerWithPresets,
} from "~/components/DatePickerWithPresets";

export function CreateTaskDialogButton() {
  function handleCreateTask() {
    createTask({
      title,
      description,
      status,
      dueDate,
      priority,
      assignedToUserId,
    });
    setOpen(false);
  }

  const ctx = api.useContext();
  const { mutate: createTask } = api.todo.create.useMutation({
    onSuccess: () => {
      void ctx.todo.getAllForLoggedUser.invalidate();
    },
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("TODO");
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState<Priority>(0);
  const [assignedToUserId, setAssignedToUserId] = useState<string | null>("");

  const { data: workspace } = api.workspace.getActiveWorkspace.useQuery();

  const [open, setOpen] = useState(false);

  const user = (workspace?.users ?? []).find((x) => x.id === assignedToUserId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="mb-64 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Input
            className="my-2 border-none"
            type="text"
            placeholder="Event title..."
            onChange={(e) => setTitle(e.target.value)}
          ></Input>
          <Textarea
            className="my-2 border-none"
            placeholder="Add description..."
            onChange={(e) => setDescription(e.target.value)}
          ></Textarea>
          <div className="flex flex-row gap-1">
            <StatusPopover setStatus={setStatus} status={status} />
            <PriorityPopover priority={priority} setPriority={setPriority}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <PriorityIcon priority={priority} className={"mr-2"} />
                  {PriorityToTxt(priority)}
                  <span className="sr-only">Open priority popover</span>
                </Button>
              </PopoverTrigger>
            </PriorityPopover>
            <AssigneePopover
              assignedToUserId={assignedToUserId}
              setAssignedToUserId={setAssignedToUserId}
              users={workspace?.users ?? []}
            >
              <Button variant="outline" size="sm">
                <span className="sr-only">Open assign user popover</span>

                {user ? (
                  <>
                    <Avatar className="mr-2 h-4 w-4">
                      <AvatarImage
                        src={user.image ?? ""}
                        alt={user.name ?? "" + " avatar"}
                      />
                      <AvatarFallback>
                        <UserCircleIcon />
                      </AvatarFallback>
                    </Avatar>
                    {user.name}
                  </>
                ) : (
                  <>
                    <UserCircleIcon className="mr-2 h-4 w-4" />
                    Assignee
                  </>
                )}
              </Button>
            </AssigneePopover>
            <DatePickerWithPresets date={dueDate} setDate={setDueDate}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={
                    !dueDate ? "text-muted-foreground" : "text-foreground"
                  }
                  size="sm"
                >
                  <DatePickerIcon date={dueDate} className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  {dueDate && (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                    <span
                      onClick={() => {
                        setDueDate(undefined);
                      }}
                      className="hover:bg-primary/90 hover:text-background ml-2 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 " />
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
            </DatePickerWithPresets>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button type="submit" size="sm" onClick={handleCreateTask}>
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
