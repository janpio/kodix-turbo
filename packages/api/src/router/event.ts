import { TRPCError } from "@trpc/server";
import moment from "moment";
import { Frequency, RRule, rrulestr } from "rrule";
import { z } from "zod";

import { _wsPrisma } from "@kdx/db";

import { authorizedEmails } from "../shared";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const eventRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        dateStart: z.date(),
        dateEnd: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const wsPrisma = ctx.prisma.$extends(
        _wsPrisma(ctx.session.user.activeWorkspaceId),
      );
      const eventMasters = await wsPrisma.eventMaster.findMany({
        where: {
          AND: [
            {
              DateStart: {
                lte: input.dateEnd,
              },
            },
            {
              OR: [
                { DateUntil: { gte: input.dateStart } },
                { DateUntil: null },
              ],
            },
          ],
        },
        include: {
          eventInfo: true,
        },
      });

      //Handling Exceptions and Cancelations
      const eventExceptions = await wsPrisma.eventException.findMany({
        where: {
          EventMaster: {
            workspaceId: ctx.session.user.activeWorkspaceId,
          },
          OR: [
            {
              originalDate: {
                gte: input.dateStart,
                lte: input.dateEnd,
              },
            },
            {
              newDate: {
                gte: input.dateStart,
                lte: input.dateEnd,
              },
            },
          ],
        },
        include: {
          EventMaster: {
            select: {
              eventInfo: true,
              rule: true,
              id: true,
            },
          },
          EventInfo: {
            select: {
              title: true,
              description: true,
            },
          },
        },
      });

      const eventCancelations = await wsPrisma.eventCancellation.findMany({
        where: {
          EventMaster: {
            workspaceId: ctx.session.user.activeWorkspaceId,
          },
          originalDate: {
            gte: input.dateStart,
            lte: input.dateEnd,
          },
        },
        include: {
          EventMaster: {
            select: {
              id: true,
            },
          },
        },
      });

      //* We have all needed data. Now, let's add all masters and exceptions to calendarTasks.
      interface CalendarTask {
        title: string | undefined;
        description: string | undefined;
        date: Date;
        rule: string;
        eventMasterId: string;
        eventExceptionId: string | undefined;
        originaDate?: Date | undefined;
      }
      let calendarTasks: CalendarTask[] = [];

      for (const eventMaster of eventMasters) {
        const rrule = rrulestr(eventMaster.rule);
        const allDates = rrule.between(input.dateStart, input.dateEnd, true);

        for (const date of allDates) {
          calendarTasks.push({
            eventMasterId: eventMaster.id,
            eventExceptionId: undefined,
            title: eventMaster.eventInfo.title ?? undefined,
            description: eventMaster.eventInfo.description ?? undefined,
            date: date,
            rule: eventMaster.rule,
          });
        }
      }

      for (const eventException of eventExceptions) {
        calendarTasks.push({
          eventMasterId: eventException.EventMaster.id,
          eventExceptionId: eventException.id,
          title:
            eventException.EventInfo?.title ??
            eventException.EventMaster.eventInfo.title ??
            undefined,
          description:
            eventException.EventInfo?.description ??
            eventException.EventMaster.eventInfo.description ??
            undefined,
          date: eventException.newDate,
          originaDate: eventException.originalDate,
          rule: eventException.EventMaster.rule,
        });
      }

      //we have exceptions and recurrences from masters in calendarTasks. Some master recurrences must be deleted.
      //because of the exception's change of date.
      calendarTasks = calendarTasks
        .map((calendarTask) => {
          if (calendarTask.eventExceptionId) {
            //handle exclusion of tasks that came from exceptions. (shouldnt appear if are outside selected range)
            if (
              moment(input.dateStart).isAfter(calendarTask.date) ||
              moment(input.dateEnd).isBefore(calendarTask.date)
            )
              return null;
          } else {
            //Cuidar de cancelamentos -> deletar os advindos do master
            const foundCancelation = eventCancelations.some(
              (x) =>
                x.eventMasterId === calendarTask.eventMasterId &&
                moment(x.originalDate).isSame(calendarTask.date),
            );
            if (foundCancelation) return null;

            //For a calendarTask that came from master,
            //Delete it if it has an exception associated with it. (originalDate === calendartask date)
            const foundException = calendarTasks.some(
              (x) =>
                x.eventExceptionId &&
                x.eventMasterId === calendarTask.eventMasterId &&
                moment(calendarTask.date).isSame(x.originaDate),
            );
            if (foundException) return null;
          }

          return calendarTask;
        })
        .filter((task): task is CalendarTask => !!task)
        .sort((a, b) => {
          if (a.date < b.date) return -1;
          if (a.date > b.date) return 1;
          return 0;
        });

      return calendarTasks;
    }),
  create: protectedProcedure
    .input(
      z
        .object({
          title: z.string(),
          description: z.string().optional(),
          from: z.date(),
          until: z
            .date()
            .transform((date) => moment(date).endOf("day").toDate())
            .optional(),
          interval: z.number().optional(),
          count: z.number().optional(),
          frequency: z.nativeEnum(Frequency),
          weekdays: z.number().array().optional(),
        })
        .refine((data) => {
          if (data.weekdays && data.frequency !== Frequency.WEEKLY)
            return false;
          return true;
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const wsPrisma = ctx.prisma.$extends(
        _wsPrisma(ctx.session.user.activeWorkspaceId),
      );
      const eventMaster = await wsPrisma.$transaction(async (tx) => {
        return await tx.eventInfo.create({
          data: {
            title: input.title,
            description: input.description,
            EventMaster: {
              create: {
                rule: new RRule({
                  dtstart: input.from,
                  until: input.until,
                  freq: input.frequency,
                  interval: input.interval,
                  count: input.count,
                  byweekday: input.weekdays,
                }).toString(),
                workspaceId: ctx.session.user.activeWorkspaceId,
                DateStart: input.from,
                DateUntil: input.until,
              },
            },
          },
        });
      });

      return eventMaster;
    }),

  cancel: protectedProcedure
    .input(
      z
        .object({
          eventMasterId: z.string(),
          eventExceptionId: z.string().optional(),
        })
        .and(
          z.union([
            z.object({
              exclusionDefinition: z.literal("all"),
            }),
            z.object({
              date: z.date(),
              exclusionDefinition: z.union([
                z.literal("thisAndFuture"),
                z.literal("single"),
              ]),
            }),
          ]),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const wsPrisma = ctx.prisma.$extends(
        _wsPrisma(ctx.session.user.activeWorkspaceId),
      );

      if (input.exclusionDefinition === "single") {
        if (input.eventExceptionId)
          return await wsPrisma.$transaction(async (tx) => {
            const deletedException = await tx.eventException.delete({
              where: {
                id: input.eventExceptionId,
              },
            });
            return await tx.eventCancellation.create({
              data: {
                eventMasterId: deletedException.eventMasterId,
                originalDate: deletedException.originalDate,
              },
            });
          });

        return await wsPrisma.eventCancellation.create({
          data: {
            EventMaster: {
              connect: {
                id: input.eventMasterId,
              },
            },
            originalDate: input.date,
          },
        });
      } else if (input.exclusionDefinition === "thisAndFuture") {
        return await wsPrisma.$transaction(async (tx) => {
          if (input.eventExceptionId) {
            const result = await tx.eventException.deleteMany({
              where: {
                id: input.eventExceptionId,
                newDate: {
                  gte: input.date,
                },
              },
            });
            if (!result.count)
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Exception not found",
              });
          }

          const eventMaster = await tx.eventMaster.findUniqueOrThrow({
            where: {
              id: input.eventMasterId,
            },
            select: {
              rule: true,
              DateStart: true,
            },
          });

          const rule = rrulestr(eventMaster.rule);
          const occurences = rule.between(
            eventMaster.DateStart,
            input.date,
            true,
          );
          const penultimateOccurence = occurences[occurences.length - 2];

          //Here we should delete the eventMaster
          if (!penultimateOccurence)
            return await tx.eventMaster.delete({
              where: {
                id: input.eventMasterId,
              },
            });

          const options = RRule.parseString(eventMaster.rule);
          options.until = penultimateOccurence;

          return await tx.eventMaster.update({
            where: {
              id: input.eventMasterId,
            },
            data: {
              DateUntil: penultimateOccurence,
              rule: new RRule(options).toString(),
            },
          });
        });
      } else if (input.exclusionDefinition === "all") {
        //We should delete the event master. It should automatically cascade down to all other tables
        return await wsPrisma.eventMaster.delete({
          where: {
            id: input.eventMasterId,
          },
        });
      }
    }),
  edit: protectedProcedure
    //* I cannot send count with single
    //* I cannot send interval with single
    //* I cannot send until with single
    //* I cannot send frequency with single
    //* I CAN send from with all, but from cannot be at a different date (day, year, or month) from the selected timestamp event's master/exception. Only hour.
    .input(
      z
        .object({
          eventMasterId: z.string(),
          eventExceptionId: z.string().optional(),
          selectedTimestamp: z.date(),
          title: z.string().optional(),
          description: z.string().optional(),
        })
        .and(
          z.union([
            z.object({
              frequency: z.nativeEnum(Frequency).optional(),
              until: z
                .date()
                .transform((date) => moment(date).endOf("day").toDate())
                .optional(),
              interval: z.number().optional(),
              count: z.number().optional(),
              from: z.date().optional(),

              editDefinition: z.enum(["thisAndFuture"]),
            }),
            z.object({
              frequency: z.nativeEnum(Frequency).optional(),
              until: z
                .date()
                .transform((date) => moment(date).endOf("day").toDate())
                .optional(),
              interval: z.number().optional(),
              count: z.number().optional(),

              from: z
                .string()
                .refine((value) => {
                  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                  return regex.test(value);
                }, "Invalid time format. Should be HH:MM")
                .optional(),

              editDefinition: z.literal("all"),
            }),
            z.object({
              from: z.date().optional(),

              editDefinition: z.literal("single"),
            }),
          ]),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const wsPrisma = ctx.prisma.$extends(
        _wsPrisma(ctx.session.user.activeWorkspaceId),
      );
      if (input.editDefinition === "single") {
        //* Havemos description, title, from e selectedTimestamp.
        //* Havemos um selectedTimestamp.
        //* Temos que procurar se temos uma ocorrencia advinda do RRULE do master que bate com o selectedTimestamp, ou se temos uma exceção que bate com o selectedTimestamp.
        //* Se não tivermos nenhum, temos que gerar um erro.

        if (input.eventExceptionId) {
          //* Temos uma exceção.  Isso significa que o usuário quer editar a exceção.
          //* Aqui, o usuário pode alterar o title e o description ou o from da exceção.
          return await wsPrisma.eventException.update({
            where: {
              id: input.eventExceptionId,
              newDate: input.selectedTimestamp,
              EventMaster: {
                workspaceId: ctx.session.user.activeWorkspaceId,
              },
            },
            data: {
              newDate: input.from,
              EventInfo:
                input.description !== undefined || input.title !== undefined //* Se o usuário não mandou nem title nem description, não fazemos nada com o EventInfo.
                  ? {
                      upsert: {
                        //* Upsert é um update ou um create. Se não existir, cria. Se existir, atualiza.
                        create: {
                          description: input.description,
                          title: input.title,
                        },
                        update: {
                          description: input.description,
                          title: input.title,
                        },
                      },
                    }
                  : undefined,
            },
          });
          //! END OF PROCEDURE
        }

        //* Se estamos aqui, o usuário enviou o masterId. Vamos procurar no eventMaster uma ocorrência do RRULE que bate com o selectedTimestamp.
        const eventMaster = await wsPrisma.eventMaster.findUniqueOrThrow({
          where: {
            id: input.eventMasterId,
            workspaceId: ctx.session.user.activeWorkspaceId,
          },
          select: {
            id: true,
            rule: true,
          },
        });

        const evtMasterRule = rrulestr(eventMaster.rule);
        const foundTimestamp = evtMasterRule.between(
          input.selectedTimestamp,
          input.selectedTimestamp,
          true,
        )[0];

        if (!foundTimestamp)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          }); //! END OF PROCEDURE

        //* Temos uma ocorrência. Isso significa que o usuário quer editar a ocorrência que veio do master.
        //* Para fazer isso, temos que criar uma NOVA EXCEÇÃO.
        if (input.title !== undefined || input.description !== undefined) {
          //* Se tivermos title ou description, criamos um eventInfo e também uma exceção.
          return await wsPrisma.eventInfo.create({
            data: {
              description: input.description,
              title: input.title,
              EventException: {
                create: {
                  EventMaster: {
                    connect: {
                      id: eventMaster.id,
                    },
                  },
                  originalDate: foundTimestamp,
                  newDate: input.from ?? foundTimestamp,
                },
              },
            },
          });
          //! END OF PROCEDURE
        } else
          return await wsPrisma.eventException.create({
            //* Se não tivermos title nem description, ainda temos o from. Criamos uma exceção sem eventInfo.
            data: {
              eventMasterId: eventMaster.id,
              originalDate: foundTimestamp,
              newDate: input.from ?? foundTimestamp,
            },
          }); //! END OF PROCEDURE

        //* Não temos uma exceção nem uma ocorrência que bate com o selectedTimestamp. Vamos gerar um erro.
      } else if (input.editDefinition === "thisAndFuture") {
        await wsPrisma.$transaction(async (tx) => {
          //* Havemos description, title, from, until, frequency, inteval, count e selectedTimestamp.
          //* Havemos um selectedTimestamp.
          //* Temos que procurar se temos uma exceção que bate com o selectedTimestamp.
          //* Se tivermos, temos que alterá-la.

          if (input.eventExceptionId) {
            //*Deletamos a exceção se exisitir.
            const exception = await tx.eventException.deleteMany({
              where: {
                EventMaster: {
                  workspaceId: ctx.session.user.activeWorkspaceId,
                  id: input.eventMasterId,
                },
                newDate: {
                  gte: input.selectedTimestamp,
                },
              },
            });
            if (!exception.count)
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Exception not found",
              });
          }

          //* Aqui, Vamos editar o eventMaster antigo.
          const oldMaster = await tx.eventMaster.findUniqueOrThrow({
            where: {
              id: input.eventMasterId,
              workspaceId: ctx.session.user.activeWorkspaceId,
            },
            select: {
              rule: true,
              eventInfoId: true,
            },
          });
          const oldRule = rrulestr(oldMaster.rule);
          const lastOccurence = oldRule.before(input.selectedTimestamp, false);
          if (!lastOccurence) {
            //* It means that the selectedTimestamp
            //* is either the first occurence of the event or it is before the first occurence.
            //* If it is before the first occurence, we should have an exception.
            //* If it is the first occurence, we should just edit the eventMaster.
            if (input.selectedTimestamp < oldRule.options.dtstart)
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Event not found",
              });
            else
              return await tx.eventMaster.update({
                where: {
                  id: input.eventMasterId,
                  workspaceId: ctx.session.user.activeWorkspaceId,
                },
                data: {
                  eventInfo:
                    input.title !== undefined || input.description !== undefined
                      ? {
                          upsert: {
                            create: {
                              title: input.title,
                              description: input.description,
                            },
                            update: {
                              title: input.title,
                              description: input.description,
                            },
                          },
                        }
                      : undefined,
                  DateStart: input.from ?? input.selectedTimestamp,
                  DateUntil: input.until ?? oldRule.options.until ?? undefined,
                  rule: new RRule({
                    dtstart: input.from ?? input.selectedTimestamp,
                    until: input.until ?? oldRule.options.until ?? undefined,
                    freq: input.frequency ?? oldRule.options.freq,
                    interval: input.interval ?? oldRule.options.interval,
                    count: input.count ?? oldRule.options.count ?? undefined,
                  }).toString(),
                },
              });
          }

          const updatedOldMaster = await tx.eventMaster.update({
            where: {
              id: input.eventMasterId,
              workspaceId: ctx.session.user.activeWorkspaceId,
            },
            data: {
              DateUntil: lastOccurence,
              rule: new RRule({
                dtstart: oldRule.options.dtstart,
                until: lastOccurence,
                freq: oldRule.options.freq,
                interval: oldRule.options.interval,
                count: oldRule.options.count ?? undefined,
              }).toString(),
            },
            select: {
              eventInfo: {
                select: {
                  title: true,
                  description: true,
                },
              },
            },
          });
          if (!updatedOldMaster)
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Could not update event master",
            });

          const newMasterCreateData = {
            workspaceId: ctx.session.user.activeWorkspaceId,
            DateStart: input.from ?? input.selectedTimestamp,
            DateUntil: input.until ?? oldRule.options.until ?? undefined,
            rule: new RRule({
              dtstart: input.from ?? input.selectedTimestamp,
              until: input.until ?? oldRule.options.until ?? undefined,
              freq: input.frequency ?? oldRule.options.freq,
              interval: input.interval ?? oldRule.options.interval,
              count: input.count ?? oldRule.options.count ?? undefined,
            }).toString(),
          };

          if (input.title !== undefined || input.description !== undefined)
            await tx.eventInfo.create({
              data: {
                title: input.title ?? updatedOldMaster.eventInfo.title,
                description:
                  input.description ?? updatedOldMaster.eventInfo.description,
                EventMaster: {
                  create: newMasterCreateData,
                },
              },
            });
          else
            await tx.eventMaster.create({
              data: {
                ...newMasterCreateData,
                eventInfoId: oldMaster.eventInfoId,
              },
            });
        });
      } else if (input.editDefinition === "all") {
        //* Se ele alterou o title ou description, Devemos verificar se ele alterou os dois.
        //* Se ele alterou os dois, devemos apagar o eventInfo de todos os eventExceptions associados ao master e criar um novo eventInfo no master (ou atualizar um existente).
        //* Se ele apagou apenas um dos dois, devemos alterar o eventInfo do master e dos eventException associado ao master caso o eventException possua eventInfo.

        //* Se ele alterou o from, devemos alterar o DateStart, rule e DateUntil do master e remover os newDates dos eventExceptions associados ao master.

        //*Temos que pegar a nova regra se alterou o input.frequency ?? input.interval ?? input.count ?? input.until ou se alterou o input.from

        return await wsPrisma.$transaction(async (tx) => {
          const newRule = await (async () => {
            const shouldUpdateRule = Boolean(
              input.frequency ??
                input.interval ??
                input.count ??
                input.until ??
                input.from,
            );
            if (!shouldUpdateRule) return undefined;

            const oldRule = rrulestr(
              (
                await tx.eventMaster.findUniqueOrThrow({
                  where: {
                    id: input.eventMasterId,
                    workspaceId: ctx.session.user.activeWorkspaceId,
                  },
                  select: {
                    rule: true,
                  },
                })
              ).rule,
            );

            const newStartDate = input.from
              ? moment(oldRule.options.dtstart)
                  .hours(moment(input.from, "HH:mm").hours())
                  .minutes(moment(input.from, "HH:mm").minutes())
                  .toDate()
              : oldRule.options.dtstart;

            return new RRule({
              dtstart: newStartDate,
              until: input.until ?? oldRule.options.until ?? undefined,
              freq: input.frequency ?? oldRule.options.freq,
              interval: input.interval ?? oldRule.options.interval,
              count: input.count ?? oldRule.options.count ?? undefined,
            }).toString();
          })();
          const eventInfoCreateOrUpdateData = {
            title: input.title,
            description: input.description,
          };

          const updatedMaster = await tx.eventMaster.update({
            where: {
              id: input.eventMasterId,
              workspaceId: ctx.session.user.activeWorkspaceId,
            },
            data: {
              EventExceptions:
                input.from ?? input.until
                  ? {
                      deleteMany: input.from
                        ? {} //Delete all exceptions if from is changed.
                        : {
                            newDate: {
                              gt: input.until, //Else, delete only the exceptions that are after or equal to the new until.
                            },
                          },
                    }
                  : undefined,

              eventInfo:
                input.title !== undefined || input.description !== undefined
                  ? {
                      upsert: {
                        create: eventInfoCreateOrUpdateData,
                        update: eventInfoCreateOrUpdateData,
                        where: {
                          EventMaster: {
                            some: {
                              id: input.eventMasterId,
                            },
                          },
                        },
                      },
                    }
                  : undefined,
              DateStart: newRule
                ? rrulestr(newRule).options.dtstart
                : undefined,
              DateUntil: input.until,
              rule: newRule,
            },
          });

          //* Now, let's handle eventInfo of exceptions.
          if (input.title !== undefined && input.description !== undefined) {
            await tx.eventInfo.deleteMany({
              where: {
                EventException: {
                  some: {
                    EventMaster: {
                      id: input.eventMasterId,
                    },
                  },
                },
              },
            });
          } else if (
            input.title !== undefined ||
            input.description !== undefined
          ) {
            await tx.eventInfo.updateMany({
              where: {
                EventException: {
                  some: {
                    EventMaster: {
                      id: input.eventMasterId,
                    },
                  },
                },
              },
              data: eventInfoCreateOrUpdateData,
            });
          }
          return updatedMaster;
        });
      }
    }),
  nuke: protectedProcedure.mutation(async ({ ctx }) => {
    const wsPrisma = ctx.prisma.$extends(
      _wsPrisma(ctx.session.user.activeWorkspaceId),
    );
    if (
      ctx.session.user.email &&
      !authorizedEmails.includes(ctx.session.user.email)
    )
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to do this",
      });

    await wsPrisma.$transaction([
      wsPrisma.eventMaster.deleteMany({
        where: { workspaceId: ctx.session.user.activeWorkspaceId },
      }),
      wsPrisma.eventInfo.deleteMany({
        where: {
          OR: [
            {
              EventMaster: {
                some: {
                  workspaceId: ctx.session.user.activeWorkspaceId,
                },
              },
              EventException: {
                some: {
                  EventMaster: {
                    workspaceId: ctx.session.user.activeWorkspaceId,
                  },
                },
              },
            },
          ],
        },
      }),
    ]);
  }),
});
