import { extendType, objectType, nonNull, stringArg, idArg, nullable, intArg, inputObjectType, enumType, arg, list } from "nexus";
import { Prisma } from "@prisma/client";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    t.nonNull.dateTime("createdAt");
    t.field("postedBy", {
      type: "User",
      resolve: (parent, _, context) => {
        return context.prisma.link
          .findUnique({
            where: { id: parent.id },
          })
          .postedBy();
      }
    });
    t.list.nonNull.field("voters", {
      type: "User",
      resolve: (parent, args, context) => {
        return context.prisma.link.findUnique({ where: { id: parent.id } }).voters();
      },
    });
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("feed", {
      type: "Feed",
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(LinkOrderByInput)) })
      },
      resolve: async (parent, args, context, info) => {
        const where = args.filter ? {
          OR: [
            { description: { contains: args.filter } },
            { url: { contains: args.filter } },
          ],
        } : {};
        const links = await context.prisma.link.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined,
        });
        const count = await context.prisma.link.count({ where });
        const id = `main-feed:${JSON.stringify(args)}`;

        return {
          count,
          id,
          links,
        };
      },
    })
    t.nullable.field("link", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },
      resolve: (parent, args, context, info) => {
        return context.prisma.link.findUnique({
          where: { id: Number(args.id) },
        });
      }
    })
  },
});

export const LinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      resolve: (parent, args, context, info) => {
        const { description, url } = args;
        const { userId } = context;
        if (!userId) {
          throw new Error("Not authenticated");
        }

        const newLink = context.prisma.link.create({
          data: {
            description,
            url,
            postedBy: { connect: {id: userId }},
          },
        });
        return newLink;
      }
    })
    t.nonNull.field("updateLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      resolve: (parent, args, context, info) => {
        const link = context.prisma.link.update({
          where: { id: Number(args.id) },
          data: {
            description: args.description,
            url: args.url,
          },
        });
        return link;
      }
    })
    t.nonNull.field("deleteLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },
      resolve: (parent, args, context, info) => {
        const link = context.prisma.link.delete({
          where: { id: Number(args.id) },
        });
        return link;
      }
    })
  },
});

export const LinkOrderByInput = inputObjectType({
  name: "LinkOrderByInput",
  definition(t) {
    t.field("description", { type: Sort });
    t.field("url", { type: Sort });
    t.field("createdAt", { type: Sort });
  }
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"]
});

export const Feed = objectType({
  name: "Feed",
  definition(t) {
    t.nonNull.list.nonNull.field("links", { type: Link });
    t.nonNull.int("count");
    t.id("id")
  }
});