"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { action } from "~/helpers/safe-action/safe-action";
import { api } from "~/trpc/server";

export const createWorkspaceAction = action(
  z.object({
    userId: z.string(),
    workspaceName: z.string(),
  }),
  async (input) => {
    const workspace = await api.workspace.create.mutate(input);
    void api.user.switchActiveWorkspace.mutate({ workspaceId: workspace.id });
    revalidatePath("/workspace");
    return workspace;
  },
);

export const switchWorkspaceAction = action(
  z.object({
    workspaceId: z.string(),
    redirect: z.string(),
  }),
  async (input) => {
    await api.user.switchActiveWorkspace.mutate(input);
    revalidatePath("/", "layout"); //IDK what this is doing exactly
  },
);
