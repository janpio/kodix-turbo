"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LuArrowRight } from "react-icons/lu";
import { z } from "zod";

import { kodixCareAppId } from "@kdx/shared";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@kdx/ui";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { trpcErrorToastDefault } from "~/helpers/miscelaneous";
import { api } from "~/trpc/react";

const formSchema = z.object({
  patientName: z.string().min(2).max(50),
});

export default function Onboarding() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
    },
  });

  const { mutate: saveConfig } = api.app.saveConfig.useMutation({
    onError: (e) => {
      trpcErrorToastDefault(e);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    saveConfig({
      appId: kodixCareAppId,
      config: { patientName: values.patientName },
    });
  }

  return (
    <MaxWidthWrapper>
      <div className="flex h-[450px] items-center justify-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="w-[450px]">
              <CardHeader>
                <CardTitle>Welcome to Kodix Care</CardTitle>
                <CardDescription>
                  To start your onboarding, submit the name of the patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your patient&apos;s name</FormLabel>
                          <FormControl>
                            <Input placeholder="John appleseed" {...field} />
                          </FormControl>
                          <FormDescription>
                            You can change this later in the settings.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit">
                  Go to Kodix Care <LuArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </MaxWidthWrapper>
  );
}
