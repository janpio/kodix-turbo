import { TRPCError } from "@trpc/server";
import moment from "moment";
import { Frequency, RRule, RRuleSet, rrulestr } from "rrule";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

function generateRule(
  startDate: Date | undefined,
  endDate: Date | undefined,
  frequency: Frequency,
  interval: number | undefined,
  count: number | undefined,
): string {
  const ruleSet = new RRuleSet();
  const rule = new RRule({
    freq: frequency,
    dtstart: startDate,
    until: endDate,
    interval,
    count,
  });
  ruleSet.rrule(rule);
  return ruleSet.toString();
}

export const eventRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        from: z.date(),
        until: z.date().optional(),
        frequency: z.nativeEnum(Frequency),
        interval: z.number().optional(),
        count: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const eventMaster = await ctx.prisma.$transaction(async (tx) => {
        const eventInfo = await tx.eventInfo.create({
          data: {
            title: input.title,
            description: input.description,
          },
        });

        return await tx.eventMaster.create({
          data: {
            rule: generateRule(
              input.from,
              input.until,
              input.frequency,
              input.interval,
              input.count,
            ),
            workspaceId: ctx.session.user.activeWorkspaceId,
            eventInfoId: eventInfo.id,
            DateStart: input.from,
            DateUntil: input.until,
          },
        });
      });

      return eventMaster;
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        dateStart: z.date(),
        dateEnd: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const eventMasters = await ctx.prisma.eventMaster.findMany({
        where: {
          workspaceId: ctx.session.user.activeWorkspaceId,
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

      type CalendarTask = {
        title: string | undefined;
        description: string | undefined;
        date: Date;
        rule: string;
      } & (
        | {
            eventMasterId: string;
            eventExceptionId: undefined;
          }
        | {
            eventExceptionId: string;
            eventMasterId: undefined;
          }
      );

      let calendarTasks: CalendarTask[] = [];

      //const eventGlobalIds = eventGlobal.map((eventMaster) => eventMaster.id)

      eventMasters.forEach((eventMaster) => {
        const rrule = rrulestr(eventMaster.rule);
        const allDates = rrule.between(input.dateStart, input.dateEnd, true);

        allDates.forEach((date) => {
          calendarTasks.push({
            eventMasterId: eventMaster.id,
            eventExceptionId: undefined,
            title: eventMaster.eventInfo.title ?? undefined,
            description: eventMaster.eventInfo.description ?? undefined,
            date: date,
            rule: eventMaster.rule,
          });
        });
      });

      //Handling Exceptions and Cancelations
      const eventExceptions = await ctx.prisma.eventException.findMany({
        where: {
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

      const eventCancelations = await ctx.prisma.eventCancellation.findMany({
        where: {
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

      calendarTasks = calendarTasks
        .map((calendarTask) => {
          //Cuidar de cancelamentos
          const foundCancelation = eventCancelations.some(
            (x) =>
              calendarTask.eventMasterId &&
              x.eventMasterId === calendarTask.eventMasterId &&
              moment(x.originalDate).isSame(calendarTask.date),
          );
          if (foundCancelation) return null;

          // No CalendarTasks tenho Date e EventId
          // Pesquiso dentro do EventExceptions filtrado se tenho algum item com OriginalDate e EventId semelhante
          // Se sim, vejo o que a exceção me pede para fazer e executo
          const foundException = eventExceptions.find(
            (exception) =>
              exception.eventMasterId === calendarTask.eventMasterId &&
              moment(exception.originalDate).isSame(calendarTask.date),
          );
          if (foundException) {
            calendarTask = {
              ...calendarTask,
              eventExceptionId: foundException.id,
              eventMasterId: undefined,
            }; //Altero o CalendarTask para ter o eventExceptionId e não ter o eventMasterId
            if (
              moment(input.dateStart).isSameOrBefore(foundException.newDate) &&
              moment(input.dateEnd).isSameOrAfter(foundException.newDate)
            ) {
              calendarTask.date = foundException.newDate;
            } else {
              //Temos exclusão do calendarTask
              return null;
            }

            if (foundException.eventInfoId) {
              //Alterou informacao
              calendarTask.description =
                foundException.EventInfo?.description ??
                calendarTask.description;
              calendarTask.title =
                foundException.EventInfo?.title ?? calendarTask.title;
            }
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
  cancelEvent: protectedProcedure
    .input(
      z
        .object({
          eventMasterId: z.string().cuid(),
          eventExceptionId: z.string().cuid(),
        })
        .partial({
          eventMasterId: true,
          eventExceptionId: true,
        })
        .refine(
          (data) => data.eventExceptionId ?? data.eventMasterId,
          "Either eventMasterId or eventExceptionId must be provided",
        )
        .refine((data) => {
          if (data.eventMasterId && data.eventExceptionId) return false;
          return true;
        }, "You cannot send both eventMasterId and eventExceptionId")
        .and(
          z.union([
            z.object({
              exclusionDefinition: z.literal("all"),
            }),
            z.object({
              exclusionDefinition: z
                .literal("thisAndFuture")
                .or(z.literal("single")),
              date: z.date(),
            }),
          ]),
        ),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.exclusionDefinition === "single") {
        if (input.eventExceptionId) {
          return await ctx.prisma.$transaction(async (tx) => {
            const deletedException = await tx.eventException.delete({
              where: {
                id: input.eventExceptionId,
              },
            });
            return await tx.eventCancellation.create({
              data: {
                eventMasterId: deletedException.eventMasterId,
                originalDate: input.date,
              },
            });
          });
        }
        const eventMaster = await ctx.prisma.eventMaster.findUnique({
          where: {
            id: input.eventMasterId,
          },
        });
        if (!eventMaster)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });

        return await ctx.prisma.eventCancellation.create({
          data: {
            eventMasterId: eventMaster.id,
            originalDate: input.date,
          },
        });
      } else if (input.exclusionDefinition === "thisAndFuture") {
        if (input.eventExceptionId) {
          const eventException =
            await ctx.prisma.eventException.findUniqueOrThrow({
              where: {
                id: input.eventExceptionId,
              },
              select: {
                eventMasterId: true,
              },
            });

          await ctx.prisma.eventException.deleteMany({
            where: {
              id: input.eventExceptionId,
              newDate: {
                gte: input.date,
              },
            },
          });

          input.eventMasterId = eventException.eventMasterId;
        }

        const eventMaster = await ctx.prisma.eventMaster.findUnique({
          where: {
            id: input.eventMasterId,
          },
        });

        if (!eventMaster)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
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
          return await ctx.prisma.eventMaster.delete({
            where: {
              id: input.eventMasterId,
            },
          });

        const options = RRule.parseString(eventMaster.rule);
        options.until = penultimateOccurence;

        return await ctx.prisma.eventMaster.update({
          where: {
            id: input.eventMasterId,
          },
          data: {
            DateUntil: penultimateOccurence,
            rule: new RRule(options).toString(),
          },
        });
      } else if (input.exclusionDefinition === "all") {
        //We should delete the event master. It should automatically cascade down to all other tables
        if (input.eventExceptionId)
          //Delete where eventMaster that has this eventExceptionId
          return await ctx.prisma.eventMaster.deleteMany({
            where: {
              EventExceptions: {
                some: {
                  id: input.eventExceptionId,
                },
              },
            },
          });

        return await ctx.prisma.eventMaster.delete({
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
    //* I cannot send from with all
    //* I cannot send eventId with eventExceptionId
    .input(
      z
        .object({
          eventMasterId: z.string().optional(),
          eventExceptionId: z.string().optional(),

          selectedTimestamp: z.date(),

          title: z.string().optional(),
          description: z.string().optional(),
        })
        .refine(
          (data) => data.eventExceptionId ?? data.eventMasterId,
          "Either eventMasterId or eventExceptionId must be provided",
        )
        .refine((data) => {
          if (data.eventMasterId && data.eventExceptionId) return false;
          return true;
        }, "You cannot send both eventMasterId and eventExceptionId")
        .and(
          z.union([
            z.object({
              frequency: z.nativeEnum(Frequency).optional(),
              until: z.date().optional(),
              interval: z.number().optional(),
              count: z.number().optional(),

              from: z.date().optional(),
              editDefinition: z.literal("thisAndFuture"),
            }),
            z.object({
              frequency: z.nativeEnum(Frequency).optional(),
              until: z.date().optional(),
              interval: z.number().optional(),
              count: z.number().optional(),

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
      if (input.editDefinition === "single") {
        //* Havemos description, title, from e selectedTimestamp.
        //* Havemos um selectedTimestamp.
        //* Temos que procurar se temos uma ocorrencia advinda do RRULE do master que bate com o selectedTimestamp, ou se temos uma exceção que bate com o selectedTimestamp.
        //* Se não tivermos nenhum, temos que gerar um erro.

        if (input.eventExceptionId) {
          //* Temos que verificar se temos uma exceção para o timestamp
          const eventException =
            await ctx.prisma.eventException.findFirstOrThrow({
              where: {
                id: input.eventExceptionId,
                newDate: input.selectedTimestamp,
              },
            });

          //* Temos uma exceção.  Isso significa que o usuário quer editar a exceção.
          //* Aqui, o usuário pode alterar o title e o description ou o from da exceção.
          return await ctx.prisma.eventException.update({
            where: {
              id: eventException.id,
            },
            data: {
              newDate: input.from,
              EventInfo:
                input.description ?? input.title //* Se o usuário não mandou nem title nem description, não fazemos nada com o EventInfo.
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
        const eventMaster = await ctx.prisma.eventMaster.findUniqueOrThrow({
          where: {
            id: input.eventMasterId,
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
        if (input.title ?? input.description) {
          //* Se tivermos title ou description, criamos um eventInfo e também uma exceção.
          return await ctx.prisma.eventInfo.create({
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
          return await ctx.prisma.eventException.create({
            //* Se não tivermos title nem description, ainda temos o from. Criamos uma exceção sem eventInfo.
            data: {
              eventMasterId: eventMaster.id,
              originalDate: foundTimestamp,
              newDate: input.from ?? foundTimestamp,
            },
          }); //! END OF PROCEDURE

        // return await ctx.prisma.eventException.create({
        //   data: {
        //     eventMasterId: eventMaster.id,
        //     originalDate: foundTimestamp,
        //     newDate: input.from,
        //     EventInfo: {
        // 			create: {
        // 				description: input.description,
        // 				title: input.title,
        // 			}
        // 		}
        //   },
        // });
        //! END OF PROCEDURE

        // return await ctx.prisma.eventMaster.update({
        //   where: {
        //     id: eventMaster.id,
        //   },
        //   data: {
        //     DateStart: input.from,
        //     eventInfo: {
        //       upsert: {
        //         //* Upsert é um update ou um create. Se não existir, cria. Se existir, atualiza.
        //         create: {
        //           description: input.description,
        //           title: input.title,
        //         },
        //         update: {
        //           description: input.description,
        //           title: input.title,
        //         },
        //       },
        //     },
        //   },
        // });
        //! END OF PROCEDURE

        //* Não temos uma exceção nem uma ocorrência que bate com o selectedTimestamp. Vamos gerar um erro.
      } else if (input.editDefinition === "thisAndFuture") {
        //* Havemos description, title, from, until, frequency, inteval, count e selectedTimestamp.
        //* Havemos um selectedTimestamp.
        //* Temos que procurar se temos uma exceção que bate com o selectedTimestamp.
        //* Se tivermos, temos que alterá-la.
        if (input.eventExceptionId) {
          //* Temos uma exceção. Isso signigica que o usuário quer editar a exceção.
          //* Aqui, o usuário pode alterar o title e o description ou o from da exceção.
        }
      } /*else if (input.editDefinition === "all") {
      }*/
    }),
});
